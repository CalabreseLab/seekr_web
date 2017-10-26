"""
Configuration file for pyunit tests
Change these values to test against different servers
"""

import os

PROTOCOL = 'http'
IP = "127.0.0.1"
PORT = 5000
URLBASE = PROTOCOL + '://' + IP + ':' + str(PORT)
SMALL_DIR = 'small'
SMALL_EX_FA_FILE = os.path.join(SMALL_DIR, 'M5_XKA.fa')
SMALL_USER_FILE = os.path.join(SMALL_DIR, 'user.fa')
SMALL_COMP_FILE = os.path.join(SMALL_DIR, 'comp.fa')

LARGE_DIR = 'large'
GENCODE_HUMAN_FILE = os.path.join(LARGE_DIR, 'gencode.v27.lncRNA_transcripts.fa')
GENCODE_MOUSE_FILE = os.path.join(LARGE_DIR, 'gencode.vM15.lncRNA_transcripts.fa')
MIDSIZE_FILE = os.path.join(LARGE_DIR, 'M14_transcripts01.fa')
MIDSIZE_FILE2 = os.path.join(LARGE_DIR, 'M14_transcripts01_short.fa')
MIDSIZE_FILE3 = os.path.join(LARGE_DIR, 'M14_transcripts01_short2.fa')

LARGE_FILES = [MIDSIZE_FILE3, MIDSIZE_FILE2, MIDSIZE_FILE, GENCODE_MOUSE_FILE, GENCODE_HUMAN_FILE]
