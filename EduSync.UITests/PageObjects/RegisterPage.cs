using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;

namespace EduSync.UITests.PageObjects
{
    public class RegisterPage
    {
        private readonly IWebDriver _driver;
        private readonly WebDriverWait _wait;

        // Locators
        private readonly By _nameInputLocator = By.Id("name");
        private readonly By _emailInputLocator = By.Id("email");
        private readonly By _passwordInputLocator = By.Id("password");
        private readonly By _confirmPasswordInputLocator = By.Id("confirmPassword");
        private readonly By _roleSelectLocator = By.Id("role");
        private readonly By _registerButtonLocator = By.CssSelector("button[type='submit']");
        private readonly By _validationErrorsLocator = By.CssSelector(".validation-error");
        private readonly By _toastNotificationLocator = By.CssSelector(".Toastify__toast-body");

        public RegisterPage(IWebDriver driver)
        {
            _driver = driver;
            _wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        }

        public void NavigateTo(string baseUrl)
        {
            _driver.Navigate().GoToUrl(baseUrl + "/register");
        }

        public void EnterName(string name)
        {
            _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementIsVisible(_nameInputLocator))
                .SendKeys(name);
        }

        public void EnterEmail(string email)
        {
            _driver.FindElement(_emailInputLocator).SendKeys(email);
        }

        public void EnterPassword(string password)
        {
            _driver.FindElement(_passwordInputLocator).SendKeys(password);
        }

        public void EnterConfirmPassword(string confirmPassword)
        {
            _driver.FindElement(_confirmPasswordInputLocator).SendKeys(confirmPassword);
        }

        public void SelectRole(string role)
        {
            var roleSelect = _driver.FindElement(_roleSelectLocator);
            var selectElement = new OpenQA.Selenium.Support.UI.SelectElement(roleSelect);
            selectElement.SelectByText(role);
        }

        public void ClickRegisterButton()
        {
            _driver.FindElement(_registerButtonLocator).Click();
        }

        public bool AreValidationErrorsDisplayed()
        {
            try
            {
                return _driver.FindElements(_validationErrorsLocator).Count > 0;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }

        public string GetToastMessage()
        {
            try
            {
                return _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementIsVisible(_toastNotificationLocator)).Text;
            }
            catch (WebDriverTimeoutException)
            {
                return string.Empty;
            }
        }

        public bool IsRegistrationSuccessful()
        {
            try
            {
                _wait.Until(driver => 
                    driver.Url.Contains("/login") || 
                    GetToastMessage().ToLower().Contains("success"));
                return true;
            }
            catch (WebDriverTimeoutException)
            {
                return false;
            }
        }

        public void Register(string name, string email, string password, string confirmPassword, string role)
        {
            EnterName(name);
            EnterEmail(email);
            EnterPassword(password);
            EnterConfirmPassword(confirmPassword);
            SelectRole(role);
            ClickRegisterButton();
        }
    }
}
