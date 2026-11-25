-- Se ejecuta una sola vez, cuando el volumen de Postgres se crea por primera vez.
-- Base de datos separada para pruebas de integración: nunca comparten datos con desarrollo.
CREATE DATABASE aei_test;
