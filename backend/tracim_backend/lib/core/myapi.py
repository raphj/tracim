import tracim_backend.lib.core.events


class MyAPIEventListener(object):

    def __init__(self):
        pass

    @tracim_backend.lib.core.events.impl
    def user_creation_hook(self, email: str):
        print('Hook pre-user-creation My API : {}'.format(email))