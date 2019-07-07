class Config(object):
    DEBUG = False

class DevelopmentConfig(Config):
    PORT = 5000
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False

app_config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
}
