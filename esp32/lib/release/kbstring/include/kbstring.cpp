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

    if(to > 99) to = 99; // pretent index out of range
    if(from < to){
        int init_i = 0;
        for(int i=from; i<to; i++){
            result[init_i] = sub[i];
            init_i++;
        }
        result[init_i] = '\0';
    }
    return result;
}

char* Kbstring::charat(char* input, int index){
    char* result = new char[2];
    for(int i=0; input[i]!='\0'; i++){
        if(i == index){
            result[0] = input[i];
            result[1] = '\0';
        }
    }
    return result;
}