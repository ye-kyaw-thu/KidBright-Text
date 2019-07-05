#ifndef kblist_h
#define kblist_h

class Kblist
{
public:
  void set_list_value();
  double get_length();
  double get_value_index();
  void set_value_at_index();
  void insert_first_value();
  void insert_last_value();
  void insert_value_index(double value, int index, double arr[], int length = 100);
  char* get_list_text(double arr[], int from, int to);
  void set_multi(double arr[], int length , int max_len, ...);
};

#endif
