#ifndef kbstring_h
#define kbstring_h

class Kbstring
{
public:
  char* concat(char* str, char* str_input);
  char* concat(char* str, double input);
  char* substring(char* str, int from, int to);
};

#endif
