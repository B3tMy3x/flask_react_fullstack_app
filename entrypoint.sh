#!/bin/bash

flask db init
flask db migrate -m "new-migration"
flask db upgrade

gunicorn -b 0.0.0.0:5000 wsgi:app
