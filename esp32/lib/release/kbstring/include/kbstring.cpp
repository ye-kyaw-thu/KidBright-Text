#include "kbstring.h"
#include <string>

#define TAG "KBSTRING"

char* Kbstring::kb_concat(char* str, char* input){
    char* result = new char[100];
    sprintf(result, "%s%s", str, input);
                       
    return result;         
}

char* Kbstring::kb_concat(char* str, double input){
    char* result = new char[100];
    sprintf(result, "%s%.2f", str, input);
                       
    return result;         
}