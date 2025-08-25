#!/usr/bin/env python
import os
import sys
import pytest

def main():
    # Change to the directory of this script
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Run pytest with the specified arguments
    sys.exit(pytest.main(['-xvs', 'tests']))

if __name__ == '__main__':
    main()