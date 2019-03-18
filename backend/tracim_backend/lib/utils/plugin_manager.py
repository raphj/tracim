from pluggy import PluginManager
from tracim_backend.lib.utils.logger import logger


class TracimPluginManager(PluginManager):

    def add_hookspecs(self, module_or_class):
        logger.info(self, 'specification "{}" added to plugin_manager'.format(module_or_class))
        super().add_hookspecs(module_or_class)

    def register(self, plugin, name=None):
        logger.info(self, 'plugin {} with name {} registered'.format(plugin, name))
        super().register(plugin, name)

def monitoring_before_hook(hook_name, methods, kwargs):
    logger.info(TracimPluginManager, 'Event "{}" launched by implementation {}.'.format(hook_name, methods))

def monitoring_after_hook(outcome, hook_name, methods, kwargs):
    logger.info(TracimPluginManager, 'Event "{}" finished.'.format(hook_name))

