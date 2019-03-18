import tracim_backend.lib.core.events
from tracim_backend.lib.core.user import UserApi



class MyAPIEventListener(object):

    def __init__(self):
        pass

    @tracim_backend.lib.core.events.impl
    def user_creation_hook(
        self,
        user_api:UserApi,
        kwargs: dict,
    ):
        if user_api._user:
            print('Hook pre-user-creation My API : {}'.format(user_api._user.email))
        else:
            print('Hook pre-user-creation: no data')

    @tracim_backend.lib.core.events.impl
    def user_created_hook(
        self,
        user_api: UserApi,
        user_id: int,
        kwargs: dict,
    ):
        user = user_api.get_one(user_id=user_id)
        if user:
            print('Hook post-user-creation My API : {}'.format(user.email))
        else:
            print('Hook post-user-creation: no data')