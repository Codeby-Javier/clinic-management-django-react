from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = 'core'
    
    def ready(self):
        """Import signals saat app ready"""
        import core.signals

