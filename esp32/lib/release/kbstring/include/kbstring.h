#ifndef kbstring_h
#define kbstring_h

class Kbstring
{
public:
  char* concat(char* str, char* str_input);
  char* concat(char* str, double input);
  char* substring(char* str, int from, int to);
  char* charat(char* input, int index);
  int string_compare(char *text1, char *text2);
};

#endif

