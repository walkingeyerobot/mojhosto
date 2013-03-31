# Mojhosto-UI

To start developing, run (in this directory):

    $ sudo npm install -g grunt-cli
    $ npm install

This will install the build system (Grunt) and all the packages you need.

Once everything installs, run one of the following:

    $ grunt dev         # build debug version and serve it from localhost:8080
                        # also rebuilds automatically when source files are changed
    $ grunt build-dev   # just build debug version
    $ grunt clean       # remove all temporary files