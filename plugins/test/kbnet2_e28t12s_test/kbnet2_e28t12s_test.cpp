#include <string.h>
#include <math.h>
#include <sys/fcntl.h>
#include <sys/errno.h>
#include <sys/unistd.h>
#include <sys/select.h>
#include <ctype.h>
#include <time.h>
#include "esp_system.h"
#include "driver/uart.h"
#include "soc/uart_struct.h"
#include "kidbright32.h"
#include "mcp7940n.h"
#include "kbnet2_e28t12s_test.h"
#include "esp_vfs.h"
#include "esp_vfs_dev.h"
#include "sound.h"
#include "mcp7940n.h"

extern SOUND sound;
extern MCP7940N mcp7940n;

#define __DEBUG__
//#undef __DEBUG__

#define E28_LED_GPIO			GPIO_NUM_25
#define E28_M0_M1_GPIO			GPIO_NUM_0	// M1:M0 => 00: transmission, 11: configuration
#define E28_AUX_GPIO			GPIO_NUM_32

#define E28_PWR_GPIO			GPIO_NUM_26
#define E28_UART_TXD_GPIO		GPIO_NUM_18
#define E28_UART_RXD_GPIO		GPIO_NUM_19
#define E28_UART_NUM			UART_NUM_1
#define E28_UART_BAUDRATE		9600
#define E28_TX_BUF_SIZE			256
#define E28_RX_BUF_SIZE			256

#define E28_POWER_DEFAULT		12
// channel frequency = 2400 + (CHAN * 1MHz)
#define E28_FREQ_START			77	// 2477 MHz
#define E28_FREQ_STOP			96	// 2496 MHz
#define E28_FREQ_DEFAULT		82	// 2482 MHz

const char *E28_SPED_76[] = {
	"8N1",
	"8O1",
	"8E1",
	"8N1"
};

const char *E28_SPED_543[] = {
	"1200",
	"4800",
	"9600",
	"19200",
	"57600",
	"115200",
	"460800",
	"921600"
};

const char *E28_SPED_210[] = {
	"continuous transmission",
	"1k",
	"5k",
	"10k",
	"50k",
	"100k",
	"1M(FLRC)",
	"2M(FSK)"
};

const int E28_2G4T27SX_OPTION_10[] = {
	27,
	23,
	20,
	17
};

const int E28_2G4T12S_OPTION_10[] = {
	12,
	10,
	7,
	4
};

#define AES_BLOCKLEN			16	// Block length in bytes - AES is 128b block only
#define AES_KEYLEN				16	// Key length in bytes
#define AES_keyExpSize			176
#define Nb						4
#define Nk						4	// number of 32 bit words in a key
#define Nr						10	// number of rounds in AES Cipher

struct AES_ctx {
	uint8_t RoundKey[AES_keyExpSize];
	uint8_t Iv[AES_BLOCKLEN];
};

// state array holding the intermediate results during decryption
typedef uint8_t state_t[4][4];

// lookup-tables are marked const so they can be placed in read-only storage instead of RAM
// numbers below can be computed dynamically trading ROM for RAM
// this can be useful in (embedded) bootloader applications, where ROM is often limited
static const uint8_t sbox[256] = {
	//0     1    2      3     4    5     6     7      8    9     A      B    C     D     E     F
	0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
	0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
	0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
	0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
	0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
	0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
	0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
	0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
	0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
	0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
	0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
	0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
	0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
	0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
	0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
	0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
};

// the round constant word array, Rcon[i], contains the values given by 
// x to the power (i-1) being powers of x (x is denoted as {02}) in the field GF(2^8)
static const uint8_t Rcon[11] = { 0x8d, 0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80, 0x1b, 0x36 };

// initialize vector
static uint8_t iv[16]  = { 0xf0, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa, 0xfb, 0xfc, 0xfd, 0xfe, 0xff };

#define getSBoxValue(num) (sbox[(num)])

// KeyExpansion produces Nb(Nr+1) round keys. The round keys are used in each round to decrypt the states. 
static void KeyExpansion(uint8_t* RoundKey, const uint8_t* Key) {
	unsigned i, j, k;
	uint8_t tempa[4]; // column/row operations
  
	// The first round key is the key itself.
	for (i = 0; i < Nk; ++i) {
		RoundKey[(i * 4) + 0] = Key[(i * 4) + 0];
		RoundKey[(i * 4) + 1] = Key[(i * 4) + 1];
		RoundKey[(i * 4) + 2] = Key[(i * 4) + 2];
		RoundKey[(i * 4) + 3] = Key[(i * 4) + 3];
	}

	// all other round keys are found from the previous round keys.
	for (i = Nk; i < Nb * (Nr + 1); ++i) {
		k = (i - 1) * 4;
		tempa[0]=RoundKey[k + 0];
		tempa[1]=RoundKey[k + 1];
		tempa[2]=RoundKey[k + 2];
		tempa[3]=RoundKey[k + 3];

		if (i % Nk == 0) {
			// This function shifts the 4 bytes in a word to the left once.
			// [a0,a1,a2,a3] becomes [a1,a2,a3,a0]

			// Function RotWord()
			const uint8_t u8tmp = tempa[0];
			tempa[0] = tempa[1];
			tempa[1] = tempa[2];
			tempa[2] = tempa[3];
			tempa[3] = u8tmp;

			// SubWord() is a function that takes a four-byte input word and 
			// applies the S-box to each of the four bytes to produce an output word.

			// Function Subword()
			tempa[0] = getSBoxValue(tempa[0]);
			tempa[1] = getSBoxValue(tempa[1]);
			tempa[2] = getSBoxValue(tempa[2]);
			tempa[3] = getSBoxValue(tempa[3]);

			tempa[0] = tempa[0] ^ Rcon[i/Nk];
		}
		j = i * 4; k=(i - Nk) * 4;
		RoundKey[j + 0] = RoundKey[k + 0] ^ tempa[0];
		RoundKey[j + 1] = RoundKey[k + 1] ^ tempa[1];
		RoundKey[j + 2] = RoundKey[k + 2] ^ tempa[2];
		RoundKey[j + 3] = RoundKey[k + 3] ^ tempa[3];
	}
}

void AES_init_ctx(struct AES_ctx* ctx, const uint8_t* key) {
	KeyExpansion(ctx->RoundKey, key);
}

void AES_init_ctx_iv(struct AES_ctx* ctx, const uint8_t* key, const uint8_t* iv) {
	KeyExpansion(ctx->RoundKey, key);
	memcpy (ctx->Iv, iv, AES_BLOCKLEN);
}
void AES_ctx_set_iv(struct AES_ctx* ctx, const uint8_t* iv) {
	memcpy (ctx->Iv, iv, AES_BLOCKLEN);
}

// AddRoundKey adds the round key to state.
// round key is added to the state by an XOR function
static void AddRoundKey(uint8_t round, state_t* state, const uint8_t* RoundKey) {
	uint8_t i,j;
	for (i = 0; i < 4; ++i) {
		for (j = 0; j < 4; ++j) {
			(*state)[i][j] ^= RoundKey[(round * Nb * 4) + (i * Nb) + j];
		}
	}
}

// SubBytes substitutes the values in the state matrix with values in an S-box
static void SubBytes(state_t* state) {
	uint8_t i, j;
	for (i = 0; i < 4; ++i) {
		for (j = 0; j < 4; ++j) {
			(*state)[j][i] = getSBoxValue((*state)[j][i]);
		}
	}
}

// ShiftRows() function shifts the rows in the state to the left
// each row is shifted with different offset
// Offset = Row number. So the first row is not shifted
static void ShiftRows(state_t* state) {
	uint8_t temp;

	// rotate first row 1 columns to left  
	temp           = (*state)[0][1];
	(*state)[0][1] = (*state)[1][1];
	(*state)[1][1] = (*state)[2][1];
	(*state)[2][1] = (*state)[3][1];
	(*state)[3][1] = temp;

	// rotate second row 2 columns to left  
	temp           = (*state)[0][2];
	(*state)[0][2] = (*state)[2][2];
	(*state)[2][2] = temp;

	temp           = (*state)[1][2];
	(*state)[1][2] = (*state)[3][2];
	(*state)[3][2] = temp;

	// rotate third row 3 columns to left
	temp           = (*state)[0][3];
	(*state)[0][3] = (*state)[3][3];
	(*state)[3][3] = (*state)[2][3];
	(*state)[2][3] = (*state)[1][3];
	(*state)[1][3] = temp;
}

static uint8_t xtime(uint8_t x) {
	return ((x<<1) ^ (((x>>7) & 1) * 0x1b));
}

// MixColumns function mixes the columns of the state matrix
static void MixColumns(state_t* state) {
	uint8_t i;
	uint8_t Tmp, Tm, t;

	for (i = 0; i < 4; ++i) {
		t   = (*state)[i][0];
		Tmp = (*state)[i][0] ^ (*state)[i][1] ^ (*state)[i][2] ^ (*state)[i][3] ;
		Tm  = (*state)[i][0] ^ (*state)[i][1] ; Tm = xtime(Tm);  (*state)[i][0] ^= Tm ^ Tmp ;
		Tm  = (*state)[i][1] ^ (*state)[i][2] ; Tm = xtime(Tm);  (*state)[i][1] ^= Tm ^ Tmp ;
		Tm  = (*state)[i][2] ^ (*state)[i][3] ; Tm = xtime(Tm);  (*state)[i][2] ^= Tm ^ Tmp ;
		Tm  = (*state)[i][3] ^ t ;              Tm = xtime(Tm);  (*state)[i][3] ^= Tm ^ Tmp ;
	}
}

// cipher is the main function that encrypts the PlainText.
static void Cipher(state_t* state, const uint8_t* RoundKey) {
	uint8_t round = 0;

	// Add the First round key to the state before starting the rounds.
	AddRoundKey(0, state, RoundKey);

	// There will be Nr rounds.
	// The first Nr-1 rounds are identical.
	// These Nr rounds are executed in the loop below.
	// Last one without MixColumns()
	for (round = 1; ; ++round) {
		SubBytes(state);
		ShiftRows(state);
		if (round == Nr) {
			break;
		}
		MixColumns(state);
		AddRoundKey(round, state, RoundKey);
	}
	// Add round key to last round
	AddRoundKey(Nr, state, RoundKey);
}

// symmetrical operation: same function for encrypting as for decrypting.
// note: any IV/nonce should never be reused with the same key
static void AES_CTR_xcrypt_buffer(struct AES_ctx* ctx, uint8_t* buf, size_t length) {
	uint8_t buffer[AES_BLOCKLEN];

	size_t i;
	int bi;
	for (i = 0, bi = AES_BLOCKLEN; i < length; ++i, ++bi) {
		if (bi == AES_BLOCKLEN) { // we need to regen xor compliment in buffer
			memcpy(buffer, ctx->Iv, AES_BLOCKLEN);
			Cipher((state_t*)buffer,ctx->RoundKey);

			// increment Iv and handle overflow
			for (bi = (AES_BLOCKLEN - 1); bi >= 0; --bi) {
				// inc will overflow
				if (ctx->Iv[bi] == 255)	{
					ctx->Iv[bi] = 0;
					continue;
				} 
				ctx->Iv[bi] += 1;
				break;   
			}
			bi = 0;
		}

		buf[i] = (buf[i] ^ buffer[bi]);
	}
}

#ifdef __DEBUG__
static const char *TAG = "KBNET2_E28T12S_TEST";
// light weight logging
#define LOGI(fmt, ...) log_print(37, fmt, __VA_ARGS__)
#define LOGW(fmt, ...) log_print(33, fmt, __VA_ARGS__)
#define LOGE(fmt, ...) log_print(31, fmt, __VA_ARGS__)
// log_print
void IRAM_ATTR log_print(int color, const char *fmt, ...) {
	va_list ap;

	va_start(ap, fmt);
	printf("\033[1;%dm(%lld) %s: ", color, esp_timer_get_time() / 1000, TAG); // timestamp in milli-second
	vprintf(fmt, ap);
	printf("\033[0m\n");
	va_end(ap);
}
#endif

void log_hexdump(char log_type, uint8_t *buf, int len) {
	int i;

	i = 0;
	while (len > 0) {
		if ((i % 16) == 0) {
			if (i != 0) {
				printf("\n");
			}
			printf("%c (%lld) %s:", log_type, esp_timer_get_time() / 1000, TAG);			
		}
		printf(" %2.2x", buf[i]);

		if (((((i + 1) % 8) == 0) && (((i + 1) % 16) != 0)) && ((len - 1) > 0))  {
			printf(" -");
		}

		i++;
		len --;
	}
	printf("\n");
}

static void vE28UartSelectTask(void *pvParameters) {
	KBNET2_E28T12S_TEST *dev = (KBNET2_E28T12S_TEST *)pvParameters;
	uint8_t dat, buf[MAX_CHAR_PER_LINE];
	bool quit, rx_packet_found;
	int len;
	
	// flush uart
	uart_flush(E28_UART_NUM);
	
	while (1) {
		// skip uart read in operation state
		if ((dev->state == KBNET2_E28T12S_TEST::s_operation) || (dev->state == KBNET2_E28T12S_TEST::s_wait_time_sync)) {
			vTaskDelay(100 / portTICK_RATE_MS);
			continue;
		}
		
		len = 0;
		rx_packet_found = false;
		quit = false;
		while (!quit) {
			// read 1 byte
			if (uart_read_bytes(E28_UART_NUM, &dat, 1, 100 / portTICK_PERIOD_MS) == 1) {
				if (!dev->wait_reply_flag) {
					quit = true;
				}
				else {
					// check first reply byte match
					if ((len == 0) && (dev->wait_reply_byte != dat)) {
						#ifdef __DEBUG__
						LOGW("rx byte %2.2x not match wait_reply_byte!", dat);
						#endif
						quit = true;
					
					}
					else {
						buf[len] = dat;
						len++;
						// check packet overflow
						if (len < MAX_CHAR_PER_LINE) {
							switch (buf[0]) {
								case 0xc0:
								//case 0xc2:
									if (len == 6) {
										rx_packet_found = true;
										quit = true;
									}
									break;

								case 0xc3:
									if (len == 8) {
										rx_packet_found = true;
										quit = true;
									}
									break;
									
								default:
									// not supported rx packet, just flush buffer
									quit = true;
									break;
							}
						}
						else {
							// packet overflow
							quit = true;
						}
					}
				}
			}
			
			if ((dev->state == KBNET2_E28T12S_TEST::s_operation) || (dev->state == KBNET2_E28T12S_TEST::s_wait_time_sync)) {
				quit = true;
			}
		}
	
		if (rx_packet_found) {	
			log_hexdump('R', (uint8_t *)buf, len);

			// copy to frame index tail
			memcpy(dev->e28_frames[dev->e28_frame_index_tail].data, buf, len);
			// set data length
			dev->e28_frames[dev->e28_frame_index_tail].length = len;

			// increment frame index tail
			if (dev->e28_frame_index_tail < (MAX_E28_FRAME_NUM - 1)) {
				dev->e28_frame_index_tail++;
			}
			else {
				dev->e28_frame_index_tail = 0;
			}
		}	
	}
	
	vTaskDelete(NULL);
}

void e28_gpio_mode(e28_mode_t m) {
	// inverting mode pin via mosfet open drain
	if (m == m_configuration) {
		gpio_set_level(E28_M0_M1_GPIO, 0);
	}
	else
	if (m == m_transmission) {
		gpio_set_level(E28_M0_M1_GPIO, 1);
	}
}

static void e28_command(uint8_t *cmd, int len, bool log_hexdump_flag) {
	if (log_hexdump_flag) {
		log_hexdump('T', cmd, len);
	}
	uart_write_bytes(E28_UART_NUM, (char *)cmd, len);
}

static void mac_to_str(char *str, uint8_t *mac) {
	int i;

	for (i = 0; i < 6; i++) {
		sprintf(&str[3 * i], "%2.2x:", mac[i]);
	}
	str[17] = '\x0';
}

static void mac_to_str_without_colon(char *str, uint8_t *mac) {
	int i;

	for (i = 0; i < 6; i++) {
		sprintf(&str[2 * i], "%2.2x", mac[i]);
	}
	str[12] = '\x0';
}

static void mac_to_dev_addr_str(char *str, uint8_t *mac) {
	int i;

	for (i = 2; i < 6; i++) {
		sprintf(&str[2 * (i - 2)], "%2.2x", mac[i]);
	}
	str[8] = '\x0';
}

static void byte_to_str(uint8_t byte, char *str) {
	uint8_t val;
	
	val = ((byte >> 4) & 0x0f);
	if (val <= 9) {
		str[0] = 0x30 + val;
	}
	else {
		str[0] = 0x37 + val;
	}
	
	val = (byte & 0x0f);
	if (val <= 9) {
		str[1] = 0x30 + val;
	}
	else {
		str[1] = 0x37 + val;
	}
}

/*
static bool ch_to_byte(char ch, uint8_t *byte) {
	if ((ch >= '0') && (ch <= '9')) {
		*byte = ch - 0x30;
		return true;
	}
	else
	if ((ch >= 'A') && (ch <= 'F')) {
		*byte = ch - ((uint8_t)('A')) + 0x0a;
		return true;
	}
	else
	if ((ch >= 'a') && (ch <= 'f')) {
		*byte = ch - ((uint8_t)('a')) + 0x0a;
		return true;
	}

	return false;
}

static bool mac_from_str(uint8_t *mac, char *str) {
	int i, indx;
	uint8_t nh, nl;

	if (strlen(str) != 12) {
		return false;
	}

	indx = 0;
	for (i = 0; i < 6; i++) {
		if (ch_to_byte(str[indx], &nh) && ch_to_byte(str[indx + 1], &nl)) {
			mac[i] = (nh << 4) | (nl);
			indx += 2;
		}
		else {
			return false;
		}
	}
	
	return true;
}*/

KBNET2_E28T12S_TEST::KBNET2_E28T12S_TEST(void) {
	int i;
	
	// set default tx power
	tx_power = E28_POWER_DEFAULT;
	
	// set frequency #1, #2
	rf_freq_1 = 82;
	rf_freq_2 = 80;
	// set current frequency
	curr_freq = rf_freq_1;

	// store network key
	strncpy(NWKSKEY, "B5A6E1B6C840146389C4ABB4835CB5BA", MAX_ABP_KEY_CHAR - 1);

	// convert hex assci to binary value
	for (i = 0; i < sizeof(aes_key); i++) {
		sscanf(&NWKSKEY[i * 2], "%2hhx", &aes_key[i]);
	}
}

void KBNET2_E28T12S_TEST::init(void) {
	gpio_config_t io_conf;
	int i;
	char chars[2], str[32];
	
	// create send queue
    send_queue = xQueueCreate(4, sizeof(ascii_frame_t));

	// outputs init
	io_conf.intr_type = GPIO_INTR_DISABLE; // disable interrupt
	io_conf.mode = GPIO_MODE_OUTPUT; // set as output mode
	io_conf.pin_bit_mask = (1ULL << E28_PWR_GPIO) | (1ULL << E28_M0_M1_GPIO) | (1ULL << E28_LED_GPIO); // pin bit mask
	io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE; // disable pull-down mode
	io_conf.pull_up_en = GPIO_PULLUP_DISABLE; // disable pull-up mode	
	// e28 power off
	gpio_set_level(E28_PWR_GPIO, 0);
	// set to configuration mode
	e28_gpio_mode(m_configuration);
	// lora led off
	led_set_level(LED_OFF);
	gpio_config(&io_conf);
	
	// inputs init
	io_conf.intr_type = GPIO_INTR_DISABLE; // disable interrupt
	io_conf.mode = GPIO_MODE_INPUT; // set as input mode
	io_conf.pin_bit_mask = (1ULL << E28_AUX_GPIO); // pin bit mask
	io_conf.pull_down_en = GPIO_PULLDOWN_DISABLE; // disable pull-down mode
	//io_conf.pull_up_en = GPIO_PULLUP_ENABLE; // enable pull-up mode
	io_conf.pull_up_en = GPIO_PULLUP_DISABLE; // disable pull-up mode
	gpio_config(&io_conf);
	
	// uart init
	uart_config_t uart_config = {
	    .baud_rate = E28_UART_BAUDRATE,
	    .data_bits = UART_DATA_8_BITS,
	    .parity = UART_PARITY_DISABLE,
	    .stop_bits = UART_STOP_BITS_1,
	    .flow_ctrl = UART_HW_FLOWCTRL_DISABLE,
	    .rx_flow_ctrl_thresh = 0,
	    .use_ref_tick = true
	};

	// uart config
	uart_param_config(E28_UART_NUM, &uart_config);
	// set uart pins
	uart_set_pin(E28_UART_NUM, E28_UART_TXD_GPIO, E28_UART_RXD_GPIO, UART_PIN_NO_CHANGE, UART_PIN_NO_CHANGE);
	// install uart driver
	uart_driver_install(E28_UART_NUM, (E28_RX_BUF_SIZE * 2), (E28_TX_BUF_SIZE * 2), 0, NULL, 0);
	// create uart select task
	xTaskCreatePinnedToCore(vE28UartSelectTask, "E28 Uart Select Task",  UART_STACK_SIZE_MIN, this, UART_TASK_PRIORITY, NULL, KIDBRIGHT_RUNNING_CORE);

	// get mac address
	esp_read_mac(mac_address.wifi_sta, ESP_MAC_WIFI_STA);
	esp_read_mac(mac_address.wifi_softap, ESP_MAC_WIFI_SOFTAP);
	esp_read_mac(mac_address.bluetooth, ESP_MAC_BT);
	esp_read_mac(mac_address.ethernet, ESP_MAC_ETH);

#ifdef __DEBUG__
	mac_to_str(str, mac_address.wifi_sta);
	LOGI("wifi sta mac = %s", str);
	mac_to_str(str, mac_address.wifi_softap);
	LOGI("wifi softap mac = %s", str);
	mac_to_str(str, mac_address.bluetooth);
	LOGI("bluetooth mac = %s", str);
	mac_to_str(str, mac_address.ethernet);
	LOGI("ethernet mac = %s", str);
	mac_to_dev_addr_str(str, mac_address.wifi_sta);
	LOGI("device address = %s", str);
#endif

	// clear e28 frames
	for (i = 0; i < MAX_E28_FRAME_NUM; i++) {
		memset(e28_frames[i].data, 0, sizeof(e28_frames[i].data));
		e28_frames[i].length = 0;
	}
	// clear reply frame
	memset(reply_frame.data, 0, sizeof(reply_frame.data));
	reply_frame.length = 0;
	
	// init frame item index
	e28_frame_index_head = 0;
	e28_frame_index_tail = 0;
	
	rate_limit_tickcnt = DEFAULT_RATE_LIMIT_MS;
	current_rate_limit_tickcnt = 0;
	first_send_flag = true;
	standby_flag = false;
	state = s_detect;

	// get current tickcnt
	led_tickcnt = get_tickcnt();	
}

int KBNET2_E28T12S_TEST::prop_count(void) {
	// not supported
	return 0;
}

bool KBNET2_E28T12S_TEST::prop_name(int index, char *name) {
	// not supported
	return false;
}

bool KBNET2_E28T12S_TEST::prop_unit(int index, char *unit) {
	// not supported
	return false;
}

bool KBNET2_E28T12S_TEST::prop_attr(int index, char *attr) {
	// not supported
	return false;
}

bool KBNET2_E28T12S_TEST::prop_read(int index, char *value) {
	// not supported
	return false;
}

bool KBNET2_E28T12S_TEST::prop_write(int index, char *value) {
	// not supported
	return false;
}

void KBNET2_E28T12S_TEST::led_set_level(uint32_t lvl) {
	led_level = lvl;
	gpio_set_level(E28_LED_GPIO, led_level);
}

uint8_t crc8(uint8_t crc, uint8_t size, uint8_t *dat) {
	// CRC-8/SMBUS (https://crccalc.com)
	// google gemini = CRC-8/CCITT 
	const uint8_t crc_tab[] = {
		0x00, 0x07, 0x0e, 0x09, 0x1c, 0x1b, 0x12, 0x15, 
		0x38, 0x3f, 0x36, 0x31, 0x24, 0x23, 0x2a, 0x2d, 
		0x70, 0x77, 0x7e, 0x79, 0x6c, 0x6b, 0x62, 0x65, 
		0x48, 0x4f, 0x46, 0x41, 0x54, 0x53, 0x5a, 0x5d, 
		0xe0, 0xe7, 0xee, 0xe9, 0xfc, 0xfb, 0xf2, 0xf5, 
		0xd8, 0xdf, 0xd6, 0xd1, 0xc4, 0xc3, 0xca, 0xcd, 
		0x90, 0x97, 0x9e, 0x99, 0x8c, 0x8b, 0x82, 0x85, 
		0xa8, 0xaf, 0xa6, 0xa1, 0xb4, 0xb3, 0xba, 0xbd, 
		0xc7, 0xc0, 0xc9, 0xce, 0xdb, 0xdc, 0xd5, 0xd2, 
		0xff, 0xf8, 0xf1, 0xf6, 0xe3, 0xe4, 0xed, 0xea, 
		0xb7, 0xb0, 0xb9, 0xbe, 0xab, 0xac, 0xa5, 0xa2, 
		0x8f, 0x88, 0x81, 0x86, 0x93, 0x94, 0x9d, 0x9a, 
		0x27, 0x20, 0x29, 0x2e, 0x3b, 0x3c, 0x35, 0x32, 
		0x1f, 0x18, 0x11, 0x16, 0x03, 0x04, 0x0d, 0x0a, 
		0x57, 0x50, 0x59, 0x5e, 0x4b, 0x4c, 0x45, 0x42, 
		0x6f, 0x68, 0x61, 0x66, 0x73, 0x74, 0x7d, 0x7a, 
		0x89, 0x8e, 0x87, 0x80, 0x95, 0x92, 0x9b, 0x9c, 
		0xb1, 0xb6, 0xbf, 0xb8, 0xad, 0xaa, 0xa3, 0xa4, 
		0xf9, 0xfe, 0xf7, 0xf0, 0xe5, 0xe2, 0xeb, 0xec, 
		0xc1, 0xc6, 0xcf, 0xc8, 0xdd, 0xda, 0xd3, 0xd4, 
		0x69, 0x6e, 0x67, 0x60, 0x75, 0x72, 0x7b, 0x7c, 
		0x51, 0x56, 0x5f, 0x58, 0x4d, 0x4a, 0x43, 0x44, 
		0x19, 0x1e, 0x17, 0x10, 0x05, 0x02, 0x0b, 0x0c, 
		0x21, 0x26, 0x2f, 0x28, 0x3d, 0x3a, 0x33, 0x34, 
		0x4e, 0x49, 0x40, 0x47, 0x52, 0x55, 0x5c, 0x5b, 
		0x76, 0x71, 0x78, 0x7f, 0x6a, 0x6d, 0x64, 0x63, 
		0x3e, 0x39, 0x30, 0x37, 0x22, 0x25, 0x2c, 0x2b, 
		0x06, 0x01, 0x08, 0x0f, 0x1a, 0x1d, 0x14, 0x13, 
		0xae, 0xa9, 0xa0, 0xa7, 0xb2, 0xb5, 0xbc, 0xbb, 
		0x96, 0x91, 0x98, 0x9f, 0x8a, 0x8d, 0x84, 0x83, 
		0xde, 0xd9, 0xd0, 0xd7, 0xc2, 0xc5, 0xcc, 0xcb, 
		0xe6, 0xe1, 0xe8, 0xef, 0xfa, 0xfd, 0xf4, 0xf3
	};
 
	while (size--) {
		crc = crc ^ *dat++; 
		crc = crc_tab[crc & 0xff];
	}

	return(crc);
}

void KBNET2_E28T12S_TEST::process(Driver *drv) {
	uint8_t buf[MAX_CHAR_PER_LINE], frame[MAX_CHAR_PER_LINE];
	char line_buf[MAX_CHAR_PER_LINE], str[32];
	char ch;
	ascii_frame_t ascii_frame;
	int i, pwr, len, line_len = 0;
	struct AES_ctx ctx;

	switch (state) {
		case s_detect:
			// e28 power off
			gpio_set_level(E28_PWR_GPIO, 0);
			// get current tickcnt					
			tickcnt = get_tickcnt();
			// go to power on state
			state = s_power_on;
			break;
			
		case s_power_on:
			if (is_tickcnt_elapsed(tickcnt, 100)) {
				// switch to configuration mode
				e28_gpio_mode(m_configuration);

				// clear wait reply flag
				wait_reply_flag = false;
				// wait no reply byte 
				wait_reply_byte = 0;
				// e28 power on
				gpio_set_level(E28_PWR_GPIO, 1);

				// get current tickcnt
				tickcnt = get_tickcnt();
				// set next state to reset
				next_state = s_reset;
				// go to wait aux state
				state = s_wait_aux;
			}
			break;

		case s_reset:
			if (is_tickcnt_elapsed(tickcnt, 500)) {
				#ifdef __DEBUG__
				LOGI("%s", "reset module");
				#endif

				// reset
				buf[0] = 0xc4;
				buf[1] = 0xc4;
				buf[2] = 0xc4;
				e28_command(buf, 3, true);

				// get current tickcnt
				tickcnt = get_tickcnt();
				// set next state to read version
				next_state = s_read_version;
				// go to wait aux state
				state = s_wait_aux;
			}
			break;

		case s_read_version:
			#ifdef __DEBUG__
			LOGI("%s", "read version");
			#endif
			
			// init frame item index
			e28_frame_index_head = 0;
			e28_frame_index_tail = 0;
			// set wait reply flag
			wait_reply_flag = true;
			
			// read version number
			buf[0] = 0xc3;
			buf[1] = 0xc3;
			buf[2] = 0xc3;
			e28_command(buf, 3, true);

			// get current tickcnt
			tickcnt = get_tickcnt();
			// set next state to read config
			next_state = s_read_config;
			// set wait reply byte
			wait_reply_byte = 0xc3;
			// go to wait uart reply state
			state = s_wait_uart_reply;
			break;

		case s_read_config:
			//ESP_LOGW(TAG, "================> %d", reply_frame.length);
			//ESP_LOG_BUFFER_HEXDUMP(TAG, reply_frame.data, reply_frame.length, ESP_LOG_WARN);
			#ifdef __DEBUG__
			LOGI("EBYTE E%2.2X v.%2.2X, %d dBm max", reply_frame.data[2], reply_frame.data[3], reply_frame.data[4]);
			#endif

			//T (1239) KBNET2_E28T12S_TEST: c3 c3 c3
			//R (1352) KBNET2_E28T12S_TEST: c3 00 47 13 0c 09 01 00
			//(1819) KBNET2_E28T12S_TEST: EBYTE E47 v.13, 12 dBm max

			LOGI("%s", "read config");				
			// read config
			buf[0] = 0xc1;
			buf[1] = 0xc1;
			buf[2] = 0xc1;
			e28_command(buf, 3, true);

			// get current tickcnt
			tickcnt = get_tickcnt();
			// set next state to write config
			next_state = s_write_config;
			// set wait reply byte
			wait_reply_byte = 0xc0;
			// go to wait uart reply state
			state = s_wait_uart_reply;
			break;
			
		case s_write_config:
			//ESP_LOGW(TAG, "================> %d", reply_frame.length);
			//ESP_LOG_BUFFER_HEXDUMP(TAG, reply_frame.data, reply_frame.length, ESP_LOG_WARN);

			//T (1819) KBNET2_E28T12S_TEST: c1 c1 c1
			//R (1931) KBNET2_E28T12S_TEST: c0 00 00 13 58 04
			//(1979) KBNET2_E28T12S_TEST: air datarate: 10k, channel: 88 (2488 MHz), trasmit power: 12 dBm
			
			pwr = E28_2G4T12S_OPTION_10[reply_frame.data[5] & 0x03];
			#ifdef __DEBUG__
			LOGI("air datarate: %s, channel: %d (%d MHz), tx power: %d dBm", E28_SPED_210[reply_frame.data[3] & 0x07], reply_frame.data[4], 2400 + reply_frame.data[4], pwr);
			#endif
			
			// compare frequency and power
			if ((reply_frame.data[4] != curr_freq) || (pwr != tx_power)) {
				#ifdef __DEBUG__
				LOGW("update new config: freq new=%d old=%d, tx_pwr new=%d old=%d", curr_freq, reply_frame.data[4], tx_power, pwr);
				#endif

				// write new config
				LOGI("%s", "write config");
				buf[0] = 0xc0;	// save the parameters when power-down
				buf[1] = 0x00;
				buf[2] = 0x00;
				buf[3] = 0x13;
				buf[4] = curr_freq; // load 2-digit rf frequency
				if (tx_power == 10) {
					buf[5] = 0x05;
				}
				else
				if (tx_power == 7) {
					buf[5] = 0x06;
				}
				else
				if (tx_power == 4) {
					buf[5] = 0x07;
				}
				else {
					buf[5] = 0x04; // maximum tx power
				}
				// send command
				e28_command(buf, 6, true);

				// get current tickcnt
				tickcnt = get_tickcnt();
				// set next state to transmission mode
				next_state = s_transmission_mode;
				// set wait reply byte
				wait_reply_byte = 0xc0;
				// go to wait uart reply state
				state = s_wait_uart_reply;
			}
			else {				
				// go to transmission mode state			
				state = s_transmission_mode;
			}
			break;

		case s_transmission_mode:
			#ifdef __DEBUG__
			LOGI("%s", "switch to transmission mode");
			#endif

			// clear wait reply flag
			wait_reply_flag = false;
			// wait no reply byte 
			wait_reply_byte = 0;

			// switch to trasmission mode
			e28_gpio_mode(m_transmission);
			
			// device ready
			initialized = true;
			error = false;
			
			// get current tickcnt
			tickcnt = get_tickcnt();
			// go to operation state			
			state = s_delay_operation;
			break;
			
		case s_delay_operation:
			if (is_tickcnt_elapsed(tickcnt, 1000)) {
				// init line length
				line_len = 0;
				// go to operation state
				state = s_operation;
			}
			break;

		case s_operation:
			if (standby_flag) {
				// wait sleep tickcnt for flushing send_queue
				if (is_tickcnt_elapsed(sleep_tickcnt, 3000)) {
					// e28 power off
					gpio_set_level(E28_PWR_GPIO, 0);
					// go to standby state
					state = s_standby;
				}
			}
			else
			if (xQueueReceive(send_queue, &curr_ascii_frame, (100 / portTICK_PERIOD_MS))) {
/*				#ifdef __DEBUG__
				curr_ascii_frame.data[curr_ascii_frame.length] = '\0';
				LOGW("ASCII Frame: %s (%d)", curr_ascii_frame.data, curr_ascii_frame.length);
				#endif*/

				curr_ascii_frame.data[curr_ascii_frame.length] = '\0';
				#ifdef __DEBUG__
				LOGW("[%d MHz] e28_command: %s", 2400 + curr_freq, curr_ascii_frame.data);
				#endif
				
				// sound on
				sound.note(36);
				// sound delay
				vTaskDelay(100 / portTICK_RATE_MS);
				// sound off
				sound.off();

				// add new line
				curr_ascii_frame.data[curr_ascii_frame.length] = '\n';
				curr_ascii_frame.data[curr_ascii_frame.length + 1] = '\0';
				// e28 send frame
				e28_command(curr_ascii_frame.data, strlen((char *)curr_ascii_frame.data), false);
				
				// get current tickcnt
				tickcnt = get_tickcnt();
				// go to operation state
				state = s_wait_time_sync;
			}
			break;
			
		case s_wait_time_sync:
			// read uart
			len = uart_read_bytes(E28_UART_NUM, buf, sizeof(buf), pdMS_TO_TICKS(100));
			if (len > 0) {
				for (i = 0; i < len; i++) {
					ch = buf[i];
					if (ch == '\n') {
						line_buf[line_len] = '\0';
						#ifdef __DEBUG__
						LOGI("got encrypted %d bytes = %s", line_len, line_buf);
						#endif

						// new length for binary frame
						len = len / 2;
						// convert hex ascii to binary value
						for (i = 0; i < len; i++) {
							sscanf(&line_buf[i * 2], "%2hhx", &frame[i]);
						}
						
						#ifdef __DEBUG__
						printf("    Frame (hex): ");
						for (i = 0; i < len; i++) {
							printf("%02X ", frame[i]);
						}
						printf("\n");
						#endif

						// decrypt frame
						AES_init_ctx_iv(&ctx, aes_key, iv);
						AES_CTR_xcrypt_buffer(&ctx, frame, len);
						
						#ifdef __DEBUG__ 
						printf("Decrypted (hex): ");
						for (i = 0; i < len; i++) {
							printf("%02X ", frame[i]);
						}
						printf("\n");
						#endif
						
						// reset for next line
						line_len = 0;
						
						// check crc8
						if (frame[0] == crc8(0, len - 1, &frame[1])) {
							// format set clock command
							snprintf(str, sizeof(str) - 1, "%02d%02d%02d%02d%02d%02d%02d", frame[8], frame[9], frame[10], frame[11], frame[12], frame[13], frame[14]);
							LOGI("lora time sync for %02x:%02x:%02x:%02x:%02x:%02x = %s", frame[2], frame[3], frame[4], frame[5], frame[6], frame[7], str);
							// set clock
							mcp7940n.write(str);
						}
						else {
							LOGE("%s", "crc8 error!");
						}
					}
					else {
						if (line_len < sizeof(line_buf) - 1) {
							line_buf[line_len++] = ch;
						}
						else {
							// overflow protection
							LOGE("%s", "uart line too long, resetting buffer!");
							line_len = 0;
						}
					}
				}
			}
			else
			// wait time sync only 3 seconds
			if (is_tickcnt_elapsed(tickcnt, 3000)) {
				if (curr_freq == rf_freq_1) {
					#ifdef __DEBUG__
					LOGI("%s", "switch to second frequency...");
					#endif
					// load second frequency
					curr_freq = rf_freq_2;

					// add to send queue
					if (xQueueSend(send_queue, &curr_ascii_frame, (20 / portTICK_PERIOD_MS)) != pdPASS) {
						#ifdef __DEBUG__
						LOGW("%s", "send_queue full, message not sent");
						#endif
					}

					// get current tickcnt
					tickcnt = get_tickcnt();
					// go to wait state
					state = s_wait;
				}
				else {
					// load first frequency
					curr_freq = rf_freq_1;
					#ifdef __DEBUG__
					LOGI("%s", "data sent 2 frequencies done.");
					#endif
					
					// go back to operation state
					state = s_operation;
				}
			}
			break;

		case s_wait_aux:	
			// wait aux go high
			if (gpio_get_level(E28_AUX_GPIO)) {
				// prepare tickcnt for next state
				tickcnt = get_tickcnt();
				// go to next state
				state = next_state;
			}
			// check timeout
			else {
				if (is_tickcnt_elapsed(tickcnt, 3000)) {
					// reset failed aux does not go high
					#ifdef __DEBUG__
					LOGE("%s", "aux does not go high time out!");
					#endif
					// go to error state
					state = s_error;
				}
			}
			break;

		case s_wait_uart_reply:
			if (e28_frame_index_head != e28_frame_index_tail) {
				// copy e28 reply frame
				memcpy(&reply_frame, &e28_frames[e28_frame_index_head], sizeof(e28_frame_t));
				// increment frame index head
				if (e28_frame_index_head < (MAX_E28_FRAME_NUM - 1)) {
					e28_frame_index_head++;
				}
				else {
					e28_frame_index_head = 0;
				}

				// go to next state
				state = next_state;
			}
			else {
				if (is_tickcnt_elapsed(tickcnt, 3000)) {
					// reset failed aux does not go high
					#ifdef __DEBUG__
					LOGE("%s", "uart reply timeout!");
					#endif
					// go to error state
					state = s_error;
				}
			}
			break;

		case s_error:
			// set error flag
			error = true;
			// clear initialized flag
			initialized = false;
			// get current tickcnt
			tickcnt = get_tickcnt();
			// goto wait and retry with detect state
			state = s_wait;
			break;

		case s_wait:
			// delay 3000ms before retry detect
			if (is_tickcnt_elapsed(tickcnt, 3000)) {
				state = s_detect;
			}
			break;

		case s_idle:
			break;
			
		case s_standby:
			break;
	}
}

bool KBNET2_E28T12S_TEST::send_01(double temperature, double humidity, double wind_speed, double wind_direction, double rain_volume, uint16_t pm25, uint16_t pm10) {
	int i;
	uint8_t crc;
	struct AES_ctx ctx;	
	ascii_frame_t ascii_frame;
	uint8_t *frame = ascii_frame.data;
	uint8_t buf[FRAME_01_SIZE];
	int dat32;
	uint8_t dat8u;
	char str[16];

	// check rate limit
	//if (first_send_flag || is_tickcnt_elapsed(current_rate_limit_tickcnt, rate_limit_tickcnt)) { // check rate limit
	if (first_send_flag) {
		// clear first send flag
		first_send_flag = false;
		// update rate limit tickcnt
		current_rate_limit_tickcnt = get_tickcnt();

//		printf("======> %.2f %.2f %.2f %.1f %.2f %d %d\n", temperature, humidity, wind_speed, wind_direction, rain_volume, pm25, pm10);

		// [frame 01]
		// <crc8><01><mac_address>  <temperature><humidity><wind_speed><wind_direction><rain_volume><pm25><pm10>
		// ( 1 + 1 + 6 = 8 bytes )  ( 4 + 4 + 4 + 1 + 4 + 2 + 2 = 21 bytes )
		// total = 29 bytes
		frame[0] = 0; // init crc8
		frame[1] = 1; // frame type 01
		memcpy(&frame[2], mac_address.wifi_sta, 6);
		dat32 = (int)(round(temperature * 100.0));
		memcpy(&frame[8], &dat32, 4);
		dat32 = (int)(round(humidity * 100.0));
		memcpy(&frame[12], &dat32, 4);
		dat32 = (int)(round(wind_speed * 100.0));
		memcpy(&frame[16], &dat32, 4);
		dat8u = (uint8_t)(wind_direction / 22.5);
		memcpy(&frame[20], &dat8u, 1);
		dat32 = (int)(round(rain_volume * 100.0));
		memcpy(&frame[21], &dat32, 4);
		memcpy(&frame[25], &pm25, 2);
		memcpy(&frame[27], &pm10, 2);
		
		#ifdef __DEBUG__
		printf("    Frame (hex): ");
		frame[0] = crc8(0, FRAME_01_SIZE - 1, &frame[1]);
		for (i = 0; i < FRAME_01_SIZE; i++) {
			printf("%02X ", frame[i]);
		}
		printf("\n");
		#endif
		
		// prepare for encrytion
		memcpy(buf, frame, FRAME_01_SIZE);
		// aes-ctr encrypt
		AES_init_ctx_iv(&ctx, aes_key, iv);
		AES_CTR_xcrypt_buffer(&ctx, buf, FRAME_01_SIZE);

		#ifdef __DEBUG__ 
		printf("Encrypted (hex): ");
		for (i = 0; i < 29; i++) {
			printf("%02X ", buf[i]);
		}
		printf("\n");
		#endif
		
		// create ascii frame
		for (i = 0; i < FRAME_01_SIZE; i++) {
			byte_to_str(buf[i], str);
			memcpy(&frame[i * 2], str, 2);
		}
		
		// add to send queue
		ascii_frame.length = 2 * FRAME_01_SIZE;
        if (xQueueSend(send_queue, &ascii_frame, (20 / portTICK_PERIOD_MS)) != pdPASS) {
			#ifdef __DEBUG__
			LOGW("%s", "send_queue full, message not sent");
			#endif
        }

/*		#ifdef __DEBUG__
		// decrypt
		AES_init_ctx_iv(&ctx, aes_key, iv);
		AES_CTR_xcrypt_buffer(&ctx, buf, FRAME_01_SIZE);
		
		printf("Decrypted (hex): ");
		for (i = 0; i < FRAME_01_SIZE; i++) {
			printf("%02X ", buf[i]);
		}
		printf("\n");

		printf("    ASCII Frame: ");
		for (i = 0; i < (2 * FRAME_01_SIZE); i++) {
			printf("%c", (char)frame[i]);
		}
		printf("\n");
		#endif*/
	}

	return true;
}

void KBNET2_E28T12S_TEST::standby_enable(void) {
	// get tickcnt for sleep
	sleep_tickcnt = get_tickcnt();
	// set standby flag
	standby_flag = true;
}

bool KBNET2_E28T12S_TEST::standby_ready(void) {
	// check if in standby state or not initialized or error
	return ((state == s_standby) || (initialized == false) || (error == true));
}
