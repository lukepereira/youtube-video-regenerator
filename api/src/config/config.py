from . import secrets

class Config(object):
    DEBUG = False

class DevelopmentConfig(Config):
    PORT = 5000
    DEBUG = True
    YOUTUBE_API_KEY = secrets.YOUTUBE_API_KEY


class ProductionConfig(Config):
    DEBUG = False
    YOUTUBE_API_KEY = secrets.YOUTUBE_API_KEY


app_config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}
