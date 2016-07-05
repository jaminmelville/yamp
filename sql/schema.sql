DROP DATABASE IF EXISTS yamp;

CREATE DATABASE yamp
  DEFAULT CHARACTER SET utf8
  DEFAULT COLLATE utf8_general_ci;

USE yamp;

CREATE TABLE Tracks
(
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  path VARCHAR(512) UNIQUE,
  mtime BIGINT,
  artist VARCHAR(255),
  title VARCHAR(255),
  album VARCHAR(255),
  picture VARCHAR(255),
  year INT,
  track INT,
  disk INT,
  duration FLOAT
);
