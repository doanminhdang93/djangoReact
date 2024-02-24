from django.urls import path
from .views import get_products_data, get_product_by_id, add_product, update_product, delete_product, login, add_user, images_by_product_id, delete_image

urlpatterns = [
    path('get_products_data/', get_products_data, name='get_products_data'),
    path('get_product_by_id/<str:product_id>/', get_product_by_id, name='get_product_by_id'),
    path('add_product/', add_product, name='add_product'),
    path('update_product/<str:product_id>/', update_product, name='update_product'),
    path('delete_product/<str:product_id>/', delete_product, name='delete_product'),
    path('add_user/', add_user, name='add_user'),
    path('login/', login, name='login'),
    path('images_by_product_id/<str:product_id>/', images_by_product_id, name='images_by_product_id'),
    path('delete_image/<str:image_id>/', delete_image, name='delete_image'),
]
