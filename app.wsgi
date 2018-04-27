activate_this = "/var/www/html/seekr/venv/bin/activate_this.py"

with open(activate_this) as file_:
	exec(file_.read(), dict(__file__=activate_this))

import os 
import sys
os.chdir('/var/www/html/seekr')
sys.path.insert(0, '/var/www/html/seekr')

from seekrServer import application
