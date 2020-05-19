# XTENSA_PATH=../xtensa-esp32-elf/bin
include lib/release/common.mk

port=/dev/tty.usbmodemFD121
board=30-ae-a4-32-db-08
USER_APP_DIR=build/$(board)
NETPIE_LIB_DIR=lib/release/netpie
NETPIE_LIB_SRC_DIR=../../lib
NETPIE_SRC_DIR=../src
NETPIE_CFLAGS=-I$(NETPIE_LIB_SRC_DIR)/kbiot -I$(NETPIE_LIB_SRC_DIR)/microgear -I$(NETPIE_LIB_SRC_DIR)/mqttclient -I$(NETPIE_LIB_SRC_DIR)/wificontroller -I$(NETPIE_LIB_SRC_DIR)/common
XTENSA_PATH=../xtensa-esp32-elf/bin

KBNETPIE_LIB_SRC_DIR=../../include
LIBNETPIE_LIB_SRC_DIR=../../release/libnetpie/include
KBNETPIE_LIB_DIR=lib/release/kbnetpie

#KBSTRING_CFLAGS=-I../../include -I../../include/ArduinoJson -I../../include/ArduinoJson/Array

all: netpie userapp

userapp:
	@rm -f $(USER_APP_DIR)/$(board).bin $(USER_APP_DIR)/$(board).elf $(USER_APP_DIR)/user_app.d $(USER_APP_DIR)/user_app.o $(USER_APP_DIR)/libmain.a
	$(XTENSA_PATH)/xtensa-esp32-elf-c++ -std=gnu++11 -fno-rtti -Og -ggdb -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(LDFLAGS) -I$(USER_APP_DIR) -c $(USER_APP_DIR)/user_app.cpp  -o $(USER_APP_DIR)/user_app.o
	$(XTENSA_PATH)/xtensa-esp32-elf-ar cru $(USER_APP_DIR)/libmain.a $(USER_APP_DIR)/user_app.o
	$(XTENSA_PATH)/xtensa-esp32-elf-g++ -nostdlib -u call_user_start_cpu0  -Wl,--gc-sections -Wl,-static -Wl,--start-group $(LDFLAGS) -L$(USER_APP_DIR) -lnetpie -lgcc -lstdc++ -lgcov  -Wl,--end-group -Wl,-EL -lfreertos -lesp32 -llog -o $(USER_APP_DIR)/$(board).elf
	../esptool --chip esp32 elf2image --flash_mode "dio" --flash_freq "40m" --flash_size "4MB" -o $(USER_APP_DIR)/$(board).bin $(USER_APP_DIR)/$(board).elf

netpie:
	@mkdir -p $(NETPIE_LIB_DIR)
	@mkdir -p $(NETPIE_LIB_DIR)/include
	@cp $(NETPIE_LIB_SRC_DIR)/wificontroller/*.h  $(NETPIE_LIB_DIR)/include
	@cp $(NETPIE_LIB_SRC_DIR)/common/*.h  $(NETPIE_LIB_DIR)/include
	@cp $(NETPIE_LIB_SRC_DIR)/microgear/*.h  $(NETPIE_LIB_DIR)/include
	@cp $(NETPIE_LIB_SRC_DIR)/kbiot/*.h  $(NETPIE_LIB_DIR)/include
	@cp $(NETPIE_LIB_SRC_DIR)/mqttclient/*.h  $(NETPIE_LIB_DIR)/include


	$(XTENSA_PATH)/xtensa-esp32-elf-gcc  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(NETPIE_CFLAGS) -c $(NETPIE_LIB_SRC_DIR)/microgear/microgear.c  -o $(NETPIE_LIB_DIR)/microgear.o
	$(XTENSA_PATH)/xtensa-esp32-elf-gcc  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(NETPIE_CFLAGS) -c $(NETPIE_LIB_SRC_DIR)/kbiot/kbiot.c  -o $(NETPIE_LIB_DIR)/kbiot.o
	$(XTENSA_PATH)/xtensa-esp32-elf-gcc  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(NETPIE_CFLAGS) -c $(NETPIE_LIB_SRC_DIR)/wificontroller/wificontroller.c  -o $(NETPIE_LIB_DIR)/wificontroller.o
	$(XTENSA_PATH)/xtensa-esp32-elf-gcc  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(NETPIE_CFLAGS) -c $(NETPIE_LIB_SRC_DIR)/common/util.c  -o $(NETPIE_LIB_DIR)/common.o

	$(XTENSA_PATH)/xtensa-esp32-elf-gcc  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(NETPIE_CFLAGS) -c $(NETPIE_LIB_SRC_DIR)/mqttclient/mqtt_client.c  -o $(NETPIE_LIB_DIR)/mqtt_client.o
	$(XTENSA_PATH)/xtensa-esp32-elf-gcc  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(NETPIE_CFLAGS) -c $(NETPIE_LIB_SRC_DIR)/mqttclient/http_parser.c  -o $(NETPIE_LIB_DIR)/http_parser.o
	$(XTENSA_PATH)/xtensa-esp32-elf-gcc  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(NETPIE_CFLAGS) -c $(NETPIE_LIB_SRC_DIR)/mqttclient/mqtt_msg.c  -o $(NETPIE_LIB_DIR)/mqtt_msg.o
	$(XTENSA_PATH)/xtensa-esp32-elf-gcc  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(NETPIE_CFLAGS) -c $(NETPIE_LIB_SRC_DIR)/mqttclient/mqtt_outbox.c  -o $(NETPIE_LIB_DIR)/mqtt_outbox.o
	$(XTENSA_PATH)/xtensa-esp32-elf-gcc  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(NETPIE_CFLAGS) -c $(NETPIE_LIB_SRC_DIR)/mqttclient/platform_esp32_idf.c  -o $(NETPIE_LIB_DIR)/platform_esp32_idf.o
	$(XTENSA_PATH)/xtensa-esp32-elf-gcc  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(NETPIE_CFLAGS) -c $(NETPIE_LIB_SRC_DIR)/mqttclient/transport.c  -o $(NETPIE_LIB_DIR)/transport.o
	$(XTENSA_PATH)/xtensa-esp32-elf-gcc  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(NETPIE_CFLAGS) -c $(NETPIE_LIB_SRC_DIR)/mqttclient/transport_ssl.c  -o $(NETPIE_LIB_DIR)/transport_ssl.o
	$(XTENSA_PATH)/xtensa-esp32-elf-gcc  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(NETPIE_CFLAGS) -c $(NETPIE_LIB_SRC_DIR)/mqttclient/transport_tcp.c  -o $(NETPIE_LIB_DIR)/transport_tcp.o
	$(XTENSA_PATH)/xtensa-esp32-elf-gcc  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(NETPIE_CFLAGS) -c $(NETPIE_LIB_SRC_DIR)/mqttclient/transport_ws.c  -o $(NETPIE_LIB_DIR)/transport_ws.o

	@rm -Rf $(NETPIE_LIB_DIR)/libnetpie.a
	$(XTENSA_PATH)/xtensa-esp32-elf-ar rcs $(NETPIE_LIB_DIR)/libnetpie.a  $(NETPIE_LIB_DIR)/*.o

	@rm -Rf $(NETPIE_LIB_DIR)/*.d
	@rm -Rf $(NETPIE_LIB_DIR)/*.o

kbnetpie:
	@mkdir -p $(KBNETPIE_LIB_DIR)
	@mkdir -p $(KBNETPIE_LIB_DIR)/include
	# @mkdir -p $(KBNETPIE_LIB_DIR)/include/ArduinoJson

	@cp $(KBNETPIE_LIB_SRC_DIR)/*.h  $(KBNETPIE_LIB_DIR)/include
	@cp $(LIBNETPIE_LIB_SRC_DIR)/*.h  $(KBNETPIE_LIB_DIR)/include
	@cp $(KBNETPIE_LIB_SRC_DIR)/*.hpp  $(KBNETPIE_LIB_DIR)/include
	@cp -r $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson* $(KBNETPIE_LIB_DIR)/include

	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Array/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Collection/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Deserialization/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Document/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Json/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Memory/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Misc/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/MsgPack/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Numbers/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Object/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Operators/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Polyfills/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Polyfills/gsl/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Polyfills/mpl/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Polyfills/type_traits/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Serialization/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Serialization/Writers/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Strings/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/StringStorage/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/Variant/*.hpp  $(KBNETPIE_LIB_DIR)/include
	# @cp $(KBNETPIE_LIB_SRC_DIR)/ArduinoJson/wificontroller/*.h  $(KBNETPIE_LIB_DIR)/include

	# $(XTENSA_PATH)/xtensa-esp32-elf-gcc  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(KBSTRING_CFLAGS) -c $(NETPIE_LIB_SRC_DIR)/kbstring/kbstring.cpp  -o $(KBNETPIE_LIB_DIR)/kbstring.o
	$(XTENSA_PATH)/xtensa-esp32-elf-g++  -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(KBSTRING_CFLAGS) -c $(KBNETPIE_LIB_SRC_DIR)/netpieclient.cpp  -o $(KBNETPIE_LIB_DIR)/netpieclient.o
	$(XTENSA_PATH)/xtensa-esp32-elf-gcc -fno-rtti -Og -ffunction-sections -fdata-sections -fstrict-volatile-bitfields -mlongcalls -nostdlib -Wall -Werror=all -Wno-error=unused-function -Wno-error=unused-but-set-variable -Wno-error=unused-variable -Wno-error=deprecated-declarations -Wextra -Wno-unused-parameter -Wno-sign-compare -fno-exceptions -DESP_PLATFORM -D IDF_VER='""' -MMD -MP  -Wno-unused-variable -Wno-unused-value -DARDUINO=10800 -DESP32=1 -DARDUINO_ARCH_ESP32=1 -DWITH_POSIX -DMBEDTLS_CONFIG_FILE='"mbedtls/esp_config.h"' -DHAVE_CONFIG_H $(CFLAGS) $(KBSTRING_CFLAGS) -c $(KBNETPIE_LIB_SRC_DIR)/wificontroller.c  -o $(KBNETPIE_LIB_DIR)/wificontroller.o


	@rm -Rf $(KBNETPIE_LIB_DIR)/libkbnetpie.a
	$(XTENSA_PATH)/xtensa-esp32-elf-ar rcs $(KBNETPIE_LIB_DIR)/libkbnetpie.a  $(KBNETPIE_LIB_DIR)/*.o

	@rm -Rf $(KBNETPIE_LIB_DIR)/*.d
	@rm -Rf $(KBNETPIE_LIB_DIR)/*.o

flash:
	../esptool --chip esp32 --port $(port) --baud 921600 --before "default_reset" --after "hard_reset" write_flash -z --flash_mode "dio" --flash_freq "40m" --flash_size detect 0x1000 lib/release/bootloader.bin 0xe000 lib/release/boot_app0.bin 0x8000 lib/release/default.bin 0x10000 $(USER_APP_DIR)/$(board).bin

