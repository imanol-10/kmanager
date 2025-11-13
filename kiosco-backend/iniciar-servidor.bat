@echo off
:: Iniciar MySQL
net start MySQL80 2>nul

:: Verificar configuración
if not exist "src\main\resources\application.properties" (
    echo Creando configuración...
    mkdir "src\main\resources" 2>nul
    echo spring.datasource.url=jdbc:mysql://localhost:3306/kmanager?createDatabaseIfNotExist=true^&useSSL=false^&serverTimezone=UTC> src\main\resources\application.properties
    echo spring.datasource.username=root>> src\main\resources\application.properties
    echo spring.datasource.password=>> src\main\resources\application.properties
    echo spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver>> src\main\resources\application.properties
    echo spring.jpa.hibernate.ddl-auto=update>> src\main\resources\application.properties
    echo spring.flyway.enabled=false>> src\main\resources\application.properties
    echo server.address=0.0.0.0>> src\main\resources\application.properties
    echo server.port=8080>> src\main\resources\application.properties
)

:: Ejecutar
mvn spring-boot:run