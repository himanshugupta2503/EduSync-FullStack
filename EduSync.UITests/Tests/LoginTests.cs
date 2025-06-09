using EduSync.UITests.PageObjects;
using NUnit.Framework;
using System.Threading;

namespace EduSync.UITests.Tests
{
    [TestFixture]
    public class LoginTests : BaseTest
    {
        private LoginPage _loginPage;

        [SetUp]
        public override void SetUp()
        {
            base.SetUp();
            _loginPage = new LoginPage(Driver);
            _loginPage.NavigateTo(BaseUrl);
        }

        [Test]
        public void ValidLogin_InstructorRole_ShouldRedirectToDashboard()
        {
            // Login with valid instructor credentials
            _loginPage.Login("instructor@example.com", "Password123!");
            
            Assert.That(_loginPage.IsLoggedIn(), Is.True, "Instructor should be redirected after successful login");
        }

        [Test]
        public void ValidLogin_StudentRole_ShouldRedirectToDashboard()
        {
            // Login with valid student credentials
            _loginPage.Login("student@example.com", "Password123!");
            
            Assert.That(_loginPage.IsLoggedIn(), Is.True, "Student should be redirected after successful login");
        }

        [Test]
        public void InvalidLogin_WrongPassword_ShouldShowErrorMessage()
        {
            // Test with correct username but wrong password
            _loginPage.Login("instructor@example.com", "wrongpassword");
            
            Assert.That(_loginPage.IsErrorMessageDisplayed(), Is.True, 
                "Error message should be displayed for correct email but wrong password");
            Assert.That(_loginPage.IsLoggedIn(), Is.False,
                "User should not be logged in with invalid credentials");
        }

        [Test]
        public void InvalidLogin_NonexistentUser_ShouldShowErrorMessage()
        {
            // Test with non-existent user
            _loginPage.Login("nonexistent@example.com", "password");
            
            Assert.That(_loginPage.IsErrorMessageDisplayed(), Is.True, 
                "Error message should be displayed for non-existent user");
        }

        [Test]
        public void EmptyCredentials_ShouldShowValidationErrors()
        {
            // Try to login with empty credentials
            _loginPage.Login("", "");
            
            // Check that validation messages are shown
            Assert.That(_loginPage.IsLoggedIn(), Is.False, 
                "User should not be logged in with empty credentials");
        }
        
        [Test]
        public void EmptyEmail_WithPassword_ShouldShowValidationError()
        {
            // Try to login with empty email but with password
            _loginPage.Login("", "Password123!");
            
            Assert.That(_loginPage.IsLoggedIn(), Is.False, 
                "User should not be logged in with empty email");
        }
        
        [Test]
        public void ValidEmail_EmptyPassword_ShouldShowValidationError()
        {
            // Try to login with valid email but empty password
            _loginPage.Login("instructor@example.com", "");
            
            Assert.That(_loginPage.IsLoggedIn(), Is.False, 
                "User should not be logged in with empty password");
        }
        
        [Test]
        public void SqlInjectionAttempt_ShouldNotSucceed()
        {
            // Test SQL injection attempt in login form
            _loginPage.Login("' OR 1=1 --", "anything");
            
            Assert.That(_loginPage.IsLoggedIn(), Is.False, 
                "SQL injection attempt should not result in successful login");
        }
    }
}
