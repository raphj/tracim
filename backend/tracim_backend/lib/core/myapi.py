import typing

import tracim_backend.lib.core.events
from sqlalchemy.orm import Session
from tracim_backend.config import CFG
from tracim_backend.lib.core.user import UserApi
from tracim_backend.models.auth import User


class MyAPIEventListener(object):

    def __init__(self):
        pass

    @tracim_backend.lib.core.events.impl
    def user_creation_hook(
        self,
        user_api:UserApi,
        kwargs: dict,
    ):
        print('Hook pre-user-creation My API : {}'.format(user_api._user.email))

    @tracim_backend.lib.core.events.impl
    def user_created_hook(
        self,
        user_api: UserApi,
        user_id: int,
        kwargs: dict,
    ):
        user = user_api.get_one(user_id=user_id)

        print('Hook post-user-creation My API : {}'.format(user_api._user.email))