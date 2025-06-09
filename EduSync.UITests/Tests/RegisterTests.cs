using EduSync.UITests.PageObjects;
using NUnit.Framework;
using System;

namespace EduSync.UITests.Tests
{
    [TestFixture]
    public class RegisterTests : BaseTest
    {
        private RegisterPage _registerPage;
        
        [SetUp]
        public override void SetUp()
        {
            base.SetUp();
            _registerPage = new RegisterPage(Driver);
            _registerPage.NavigateTo(BaseUrl);
        }

        [Test]
        public void ValidRegistration_ShouldCreateAccount()
        {
            // Generate unique email to avoid conflicts with existing accounts
            string uniqueEmail = $"test_{DateTime.Now:yyyyMMddHHmmss}@example.com";
            
            _registerPage.Register(
                name: "Test User",
                email: uniqueEmail,
                password: "Password123!",
                confirmPassword: "Password123!",
                role: "Student" // Or "Instructor" based on your application options
            );
            
            // Verify registration was successful (redirected to login or success message)
            Assert.That(_registerPage.IsRegistrationSuccessful(), Is.True, 
                "Registration should be successful with valid inputs");
        }

        [Test]
        public void InvalidRegistration_PasswordMismatch_ShouldShowError()
        {
            _registerPage.Register(
                name: "Test User",
                email: "test@example.com",
                password: "Password123!",
                confirmPassword: "DifferentPassword123!", // Mismatched password
                role: "Student"
            );
            
            // Verify error message is shown
            Assert.That(_registerPage.AreValidationErrorsDisplayed(), Is.True, 
                "Validation errors should be displayed for mismatched passwords");
                
            // Verify we're still on the registration page
            Assert.That(Driver.Url.Contains("/register"), Is.True, 
                "User should remain on registration page after validation error");
        }
        
        [Test]
        public void EmptyFields_ShouldPreventRegistration()
        {
            // Try to register with empty required fields
            _registerPage.ClickRegisterButton();
            
            // Verify validation errors are shown
            Assert.That(_registerPage.AreValidationErrorsDisplayed(), Is.True, 
                "Validation errors should be displayed for empty required fields");
        }
        
        [Test]
        public void InvalidEmail_ShouldShowValidationError()
        {
            _registerPage.Register(
                name: "Test User",
                email: "invalid-email", // Invalid email format
                password: "Password123!",
                confirmPassword: "Password123!",
                role: "Student"
            );
            
            // Verify error message is shown
            Assert.That(_registerPage.AreValidationErrorsDisplayed(), Is.True, 
                "Validation errors should be displayed for invalid email format");
        }
    }
}
