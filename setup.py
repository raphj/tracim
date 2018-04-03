import os

import sys
from setuptools import setup, find_packages

here = os.path.abspath(os.path.dirname(__file__))
with open(os.path.join(here, 'README.txt')) as f:
    README = f.read()
with open(os.path.join(here, 'CHANGES.txt')) as f:
    CHANGES = f.read()

requires = [
    'plaster_pastedeploy',
    'pyramid >= 1.9a',
    'pyramid_debugtoolbar',
    'pyramid_jinja2',
    'pyramid_retry',
    'pyramid_tm',
    'SQLAlchemy',
    'transaction',
    'zope.sqlalchemy',
    'waitress',
    'filedepot',
    'babel',
    'alembic',
]

tests_require = [
    'WebTest >= 1.3.1',  # py3 compat
    'pytest',
    'pytest-cov',
    'nose',
    'pep8',
    'mypy',
]

# Python version adaptations
if sys.version_info < (3, 5):
    requires.append('typing')


setup(
    name='tracim_backend',
    version='1.9.1',
    description='Rest API (Back-end) of Tracim v2',
    long_description=README + '\n\n' + CHANGES,
    classifiers=[
        'Development Status :: 2 - Pre-Alpha',
        'Programming Language :: Python',
        "Programming Language :: Python :: 3.4",
        "Programming Language :: Python :: 3.5",
        "Programming Language :: Python :: 3.6",
        'Framework :: Pyramid',
        'Topic :: Internet :: WWW/HTTP',
        'Topic :: Internet :: WWW/HTTP :: WSGI :: Application',
        'Topic :: Communications :: File Sharing',
        'Topic :: Communications',
        'License :: OSI Approved :: MIT License',
    ],
    author='',
    author_email='',
    url='https://github.com/tracim/tracim_backend',
    keywords='web pyramid tracim ',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    extras_require={
        'testing': tests_require,
    },
    install_requires=requires,
    entry_points={
        'paste.app_factory': [
            'main = tracim:main',
        ],
        'console_scripts': [
            'initialize_tracim_db = tracim.scripts.initializedb:main',
        ],
    },
)
