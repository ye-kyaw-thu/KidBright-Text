#include "kblist.h"
#include <string>
#include <stdarg.h>

#define TAG "KBLIST"

void Kblist::set_list_value(){
    //...
};
double Kblist::get_length(){
    //...
    return (double)0.0;
};
double Kblist::get_value_index(){
    //...
    return (double)0.0;
};
void Kblist::set_value_at_index(){
    //...
};
void Kblist::insert_first_value(double value, double arr[], int length){
    double rest_value;
    for(int i=0; i<length; i++){
        if(i == length - 1){
            arr[i] = value;
        } else {
            rest_value = arr[i];
            arr[i] = value;
            value = rest_value;
        }
    }
};
void Kblist::insert_last_value(double value, double arr[], int length){
    double rest_value;
    for(int i=length - 1; i>0; i--){
        if(i == 0){
            arr[i] = value;
        } else {
            rest_value = arr[i];
            arr[i] = value;
            value = rest_value;
        }
    }    
};
void Kblist::insert_value_index(double value, int index, double arr[], int length){
    double rest_value = arr[index];
    for(int i=index; i<length; i++){
        if((i == length -1) && (i == index)){
            arr[i] = value;
        } else if ((i != length - 1) && (i == index)){
            arr[i] = value;
            value = rest_value;
        } else if(i == length -1){
            arr[i] = value;
        } else {
            rest_value = arr[i];
            arr[i] = value;
            value = rest_value;
        }
    }
}
char* Kblist::get_list_text(double arr[], int from, int to){
    char* result = new char[100];
    for(int i=from; i<to; i++){
        if(i == from)
            sprintf(result, "%.2f", arr[i]);
        else
            sprintf(result, "%s, %.2f", result, arr[i]);
    }
    
    return result;   
} 
void Kblist::set_multi(double arr[], int length, int max_len, ...){
    for(int j=0; j<max_len; j++){
        arr[j] = 0.0;
    }
    va_list ap;
    va_start(ap, length); //Requires the last fixed parameter (to get the address)
    for(int i=0; i<length; i++){
        arr[i] = va_arg(ap, double); //Requires the type to cast to. Increments ap to the next argument.
    }
    va_end(ap);
}