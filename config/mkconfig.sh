#! /bin/sh
cat > config.json <<EOF 
{
	"username": "$DATABASE_USER", 
	"password": "$DATABASE_PASSWORD", 
	"database": "$DATABASE_NAME", 
	"host": "$DATABASE_HOST", 
	"dialect": "$DATABASE_DIALECT", 
	"storage": "$DATABASE_STORAGE",
	"port": "$DATABASE_PORT",
	"protocol": "$DATABASE_PROTOCOL", 
	"omitNull": true
} EOF