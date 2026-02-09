from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('login/', views.login_view, name='login'),
    path('register/', views.register_view, name='register'),
    path('logout/', views.logout_view, name='logout'),
    path('room/<str:room_name>/', views.room, name='room'),
    path('api/update-display-name/', views.update_display_name, name='update_display_name'),
]