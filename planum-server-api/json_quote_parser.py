#!/usr/bin/env python

"""
=================================================================
  JSON quote parser
=================================================================
"""
__author__ = "Jorge Madrid"
__copyright__ = "Planum 2014, Spain"

import sys
import re

def main(args):
  filename = args[0]
  new_filename = filename.split('.')[0] + '.dq.txt'
  print new_filename
  f = open(filename, 'r')
  out = open(new_filename, 'w')
  for line in f:
    new_line = re.sub(r'(\w+):( |\n)', r'"\1":\2', line).replace("'", '"')
    out.write(new_line)
  f.close()
  out.close()


if __name__ == "__main__":
  main(sys.argv[1:])
