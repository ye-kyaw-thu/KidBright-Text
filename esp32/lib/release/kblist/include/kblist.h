#ifndef kblist_h
#define kblist_h

class Kblist
{
public:
  int get_length(double arr[], int length = 100);
  double get_value_index();
  void set_list_value();
  void set_value_at_index();
  void insert_first_value(double value, double arr[], int length = 100);
  void insert_last_value(double value, double arr[], int length = 100);
  void insert_value_index(double value, int index, double arr[], int length = 100);
  char* get_list_text(double arr[], int from, int to);
  void set_multi(double arr[], int length , int max_len, ...);
};

#endif
