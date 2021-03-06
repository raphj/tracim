tracim_backend
==============

Backend source code of Tracim v2, using Pyramid Framework.

Installation
---------------

### Distribution dependencies ###

on Debian Stretch (9) with sudo:

    sudo apt update && sudo apt install \
    ghostscript \
    git \
    imagemagick \
    libfile-mimeinfo-perl \
    libjpeg-dev \
    libldap2-dev \
    libmagickwand-dev \
    libpq-dev \
    libsasl2-dev \
    poppler-utils \
    python3 \
    python3-dev \
    python3-pip \
    python3-venv \
    qpdf \
    ufraw-batch \
    ffmpeg \
    redis-server \
    zlib1g-dev \
    exiftool

for better preview support:

    sudo apt install libreoffice # most office documents file and text format
    sudo apt install inkscape # for .svg files.

### Get the source ###

get source from github:

    git clone https://github.com/tracim/tracim.git

go to *backend* subdirectory:

    cd backend

### Setup Python Virtualenv ###

Create a Python virtual environment:

    python3 -m venv env

Activate it in your terminal session (**all Tracim command execution must be executed under this virtual environment**):

    source env/bin/activate

Upgrade packaging tools:

    pip install --upgrade pip setuptools wheel

(Optional) Install strict supported version of dependencies with requirement.txt:

    pip install -r requirements.txt

Install the project in editable mode with its develop requirements:

    pip install -e ".[dev]"

If you want to use PostgreSQL, MySQL or other database engines
than the default one (SQLite), you need to install python driver for those databases
that are supported by SQLAlchemy.

For PostgreSQL and MySQL, those are shortcuts to install Tracim with test and
specific driver.

For PostgreSQL:

    pip install -e ".[dev,postgresql]"

For mySQL:

    pip install -e ".[dev,mysql]"

Configuration
---------------

Create [configuration file](doc/setting.md) for a development environment:

    cp development.ini.sample development.ini

The provided default configuration is suitable for local-test. If you need to run Tracim
over network, see [configuration file documentation](doc/setting.md).

You need to create a color.json file at root of Tracim:

    cp ../color.json.sample ../color.json

You should also create requested folder for running tracim:

    mkdir sessions_data sessions_lock depot previews radicale_storage

Initialize the database using [tracimcli](doc/cli.md) tool

    tracimcli db init

Stamp current version of database to last (useful for migration):

    alembic -c development.ini stamp head

Running Tracim Backend WSGI APP
---------------

You can run Tracim WSGI apps with many WSGI servers. We provide examples to run them with:
- uWSGI using wsgi/* script.
- The pserve command of pyramid which only rely on development.ini pastedeploy config.

### With uWSGI: great for production ###

#### Install uWSGI

On Debian:

    sudo apt install uwsgi uwsgi-plugin-python3

Or with PIP:

    sudo pip3 install uwsgi

#### All in terminal way ####


Run all web services with uWSGI:

    ## UWSGI SERVICES
    # set tracim_conf_file path
    export TRACIM_CONF_PATH="$(pwd)/development.ini"
    # pyramid webserver
    uwsgi -d /tmp/tracim_web.log --http-socket :6543 --plugin python3 --wsgi-file wsgi/web.py -H env --pidfile /tmp/tracim_web.pid
    # webdav wsgidav server
    uwsgi -d /tmp/tracim_webdav.log --http-socket :3030 --plugin python3 --wsgi-file wsgi/webdav.py -H env --pidfile /tmp/tracim_webdav.pid
    # caldav radicale server (used behind pyramid webserver for auth)
    uwsgi -d /tmp/tracim_caldav.log --http-socket localhost:5232 --plugin python3 --wsgi-file wsgi/caldav.py -H env --pidfile /tmp/tracim_caldav.pid

To stop them:

    # pyramid webserver
    uwsgi --stop /tmp/tracim_web.pid
    # webdav wsgidav server
    uwsgi --stop /tmp/tracim_webdav.pid
    # caldav radicale server
    uwsgi --stop /tmp/tracim_caldav.pid

#### With uWSGI ini script file ####

You can also preset uWSGI config for Tracim by creating this kind of .ini file:

    # You need to replace <PATH> with correct absolute path
    [uwsgi]
    plugins = python3
    chdir = <PATH>/tracim/backend/
    module = wsgi.web:application
    home = <PATH>/tracim/backend/env/
    env = TRACIM_CONF_PATH=<PATH>/tracim/backend/development.ini

And for WebDAV:

    # You need to replace <PATH> with correct absolute path
    [uwsgi]
    plugins = python3
    chdir = <PATH>/tracim/backend/
    module = wsgi.webdav:application
    home = <PATH>/tracim/backend/env/
    env = TRACIM_CONF_PATH=<PATH>/tracim/backend/development.ini

And for CalDAV:

    # You need to replace <PATH> with correct absolute path
    [uwsgi]
    plugins = python3
    chdir = <PATH>/tracim/backend/
    module = wsgi.caldav:application
    home = <PATH>/tracim/backend/env/
    env = TRACIM_CONF_PATH=<PATH>/tracim/backend/development.ini

You can then run the process this way:

    # You need to replace <WSGI_CONF_WEB> with correct path
    uwsgi --ini <WSGI_CONF_WEB>.ini --http-socket :6543
    # You need to replace <WSGI_CONF_WEBDAV> with correct path
    uwsgi --ini <WSGI_CONF_WEBDAV>.ini --http-socket :3030
    # You need to replace <WSGI_CONF_CALDAV> with correct path
    uwsgi --ini <WSGI_CONF_CALDAV>.ini --http-socket localhost:5232

### With Pserve: legacy way, useful for debug and dev ###

This method relies on development.ini configuration. default web server used is _Waitress_
in` development.ini.sample`

Run the tracim_backend web api:

    pserve development.ini

Run the WsgiDAV server:

    tracimcli webdav start

Run the CalDAV server:

    tracimcli caldav start

Running Tracim Backend Daemon
---------------

Feature such as async email notification and email reply system need additional
daemons to work correctly.

### The Python way

#### Run daemons

    # set tracim_conf_file path
    export TRACIM_CONF_PATH="$(pwd)/development.ini"
    ## DAEMONS SERVICES
    # email notifier (if async email notification is enabled)
    python3 daemons/mail_notifier.py &
    # email fetcher (if email reply is enabled)
    python3 daemons/mail_fetcher.py &

#### Stop daemons

    # email notifier
    killall python3 daemons/mail_notifier.py
    # email fetcher
    killall python3 daemons/mail_fetcher.py

### Using supervisor

#### Install supervisor

    sudo apt install supervisor

#### Configure supervisord.conf file

Example of supervisord.conf file:

    [supervisord]
    ; You need to replace <PATH> with correct absolute path

    ; email notifier (if async email notification is enabled)
    [program:tracim_mail_notifier]
    directory=<PATH>/tracim/backend/
    command=<PATH>/tracim/backend/env/bin/python <PATH>/tracim/backend/daemons/mail_notifier.py
    stdout_logfile =/tmp/mail_notifier.log
    redirect_stderr=true
    autostart=true
    autorestart=true
    environment=TRACIM_CONF_PATH=<PATH>/tracim/backend/development.ini

    ; email fetcher (if email reply is enabled)
    [program:tracim_mail_fetcher]
    directory=<PATH>/tracim/backend/
    command=<PATH>/tracim/backend/env/bin/python <PATH>/tracim/backend/daemons/mail_fetcher.py
    stdout_logfile =/tmp/mail_fetcher.log
    redirect_stderr=true
    autostart=true
    autorestart=true
    environment=TRACIM_CONF_PATH=<PATH>/tracim/backend/development.ini

Run with (supervisord.conf should be provided, see [supervisord.conf default_paths](http://supervisord.org/configuration.html):

    supervisord

## Run tests and others checks ##

### Run tests ###

Some directory are required to make tests functional, you can create them and do some other check
with this script:

    # in backend folder
    python3 ./setup_dev_env.py

Before running some functional test related to email, you need a local working *MailHog*
see here: https://github.com/mailhog/MailHog

You can run it this way with Docker:

    docker pull mailhog/mailhog
    docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

You need also a test ldap server on port 3890 for ldap related test.
See here: https://github.com/rroemhild/docker-test-openldap

You can run it this way with Docker:

    docker pull rroemhild/test-openldap
    docker run -d -p 3890:389 rroemhild/test-openldap

You need also a elasticsearch server on port 9200 for elasticsearch related test
You can run it this way with Docker:

    docker pull elasticsearch:7.0.0
    docker run -d -p 9200:9200 -p 9300:9300 -v esdata:/usr/share/elasticsearch -v esconfig:/usr/share/elasticsearch/config -e "discovery.type=single-node" -e "cluster.routing.allocation.disk.threshold_enabled=false" elasticsearch:7.0.0

Run your project's tests:

    pytest

### Lints and others checks ###

Run mypy checks:

    mypy --ignore-missing-imports --disallow-untyped-defs tracim_backend

Code formatting using black:

    black -l 100 tracim_backend

Sorting of import:

    isort tracim_backend/**/*.py

Flake8 check(unused import, variable and many other checks):

    flake8 tracim_backend

### About Pytest tests config ###

For running tests, Tracim tests need config to be set:
- specific config for specific tests is
available in TEST_CONFIG_FILE_PATH (by default: "./tests_configs.ini" in backend folder).
- For more general config, pytest rely on dotenv .env file (by default ".test.env" in backend folder)
- If you want to change general config like paths used or database, you should better use env var
instead of modifying "TEST_CONFIG_FILE_PATH" file or ".test.env".

for example, if you want to use another database, you can do this:

    export TRACIM_SQLALCHEMY__URL=sqlite:////tmp/mydatabase
    python3 ./setup_dev_env.py
    pytest

Order of usage is (from less to more important, last is used if set):
- specific TEST_CONFIG_FILE_PATH config (different for each test)
- default env var setting in .test.env
- env var set by user

Tracim API
----------

Tracim_backend give access to a REST API in */api/v2*.
This API is auto-documented with [Hapic](https://github.com/algoo/hapic).
The specification is accessible when you run Tracim, go to */api/v2/doc* .

For example, with default config:

    # run Tracim
    pserve development.ini
    # launch your favorite web-browser
    firefox http://localhost:6543/api/v2/doc/

## Roles, profile and access rights

In Tracim, only some user can access to some informations, this is also true in
Tracim REST API. you can check the [roles documentation](doc/roles.md) to check
what a specific user can do.

# Known issues

see [here](doc/known_issues.md)
