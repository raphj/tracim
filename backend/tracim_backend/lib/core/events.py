from tracim_backend.extensions import plugin_manager
from tracim_backend.extensions import events_impl


class MyApi(object):

    def __init__(self):
        pass

# class MyApiEvent(object):

    @events_impl
    def user_creation_hook(self, email: str):
        print('Hook pre-user-creation : {}'.format(email))

plugin_manager.register(MyApi())

