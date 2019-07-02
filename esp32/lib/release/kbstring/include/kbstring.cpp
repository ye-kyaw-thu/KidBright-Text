#include "kbstring.h"
#include <string>

#define TAG "KBSTRING"

char* Kbstring::concat(char* str, char* input){
    char* result = new char[100];
    sprintf(result, "%s%s", str, input);
                       
    return result;         
}

char* Kbstring::concat(char* str, double input){
    char* result = new char[100];
    sprintf(result, "%s%.2f", str, input);
                       
    return result;         
}

char* Kbstring::substring(char* str, int from, int to){
    char* sub = str;
    char* result = new char[100];
    int init_i = 0;
    for(int i=from; i<to; i++){
        result[init_i] = sub[i];
        init_i++;
    }
    result[init_i] = '\0';
    return result;
}