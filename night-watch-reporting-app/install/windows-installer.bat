@echo off
echo Installing Night Watch Reporting App...

echo Step 1: Installing Node.js...
echo Please ensure Node.js is installed. If not, download it from https://nodejs.org/
node -v
if %errorlevel% neq 0 (
    echo Node.js is not installed. Please install it and run this script again.
    exit /b
)

echo Step 2: Installing MySQL...
echo Please ensure MySQL is installed and running. If not, download it from https://dev.mysql.com/downloads/mysql/
mysql --version
if %errorlevel% neq 0 (
    echo MySQL is not installed. Please install it and run this script again.
    exit /b
)

echo Step 3: Setting up the database...
mysql -u root -p < ..\database\schema.sql
if %errorlevel% neq 0 (
    echo Database setup failed. Please check your MySQL configuration.
    exit /b
)

echo Step 4: Installing backend dependencies...
cd ..\backend
npm install
if %errorlevel% neq 0 (
    echo Backend dependencies installation failed.
    exit /b
)

echo Step 5: Installing frontend dependencies...
cd ..\frontend
npm install
if %errorlevel% neq 0 (
    echo Frontend dependencies installation failed.
    exit /b
)

echo Installation completed successfully!
echo You can now run the backend with "npm start" in the backend directory and the frontend with "npm start" in the frontend directory.
pause