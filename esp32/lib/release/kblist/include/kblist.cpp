#include "kblist.h"
#include <string>

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
void Kblist::insert_first_value(){
    //...
};
void Kblist::insert_last_value(){
    //...
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
char* Kblist::get_list_text(){
    //...
    return (char *)"a";
};