# Generated by Django 4.1.2 on 2022-12-26 23:45

from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('network', '0004_alter_profile_followers'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='likes',
            field=models.ManyToManyField(blank=True, related_name='likedPosts', to=settings.AUTH_USER_MODEL),
        ),
    ]
