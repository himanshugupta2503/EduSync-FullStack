using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;

namespace EduSync.UITests.PageObjects
{
    public class LoginPage
    {
        private readonly IWebDriver _driver;
        private readonly WebDriverWait _wait;

        // Locators
        private readonly By _emailInputLocator = By.Id("email");
        private readonly By _passwordInputLocator = By.Id("password");
        private readonly By _loginButtonLocator = By.CssSelector("button[type='submit']");
        private readonly By _errorMessageLocator = By.CssSelector(".error-message");

        public LoginPage(IWebDriver driver)
        {
            _driver = driver;
            _wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        }

        public void NavigateTo(string baseUrl)
        {
            _driver.Navigate().GoToUrl(baseUrl + "/login");
        }

        public void EnterEmail(string email)
        {
            _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementIsVisible(_emailInputLocator))
                .SendKeys(email);
        }

        public void EnterPassword(string password)
        {
            _driver.FindElement(_passwordInputLocator).SendKeys(password);
        }

        public void ClickLoginButton()
        {
            _driver.FindElement(_loginButtonLocator).Click();
        }

        public bool IsErrorMessageDisplayed()
        {
            try
            {
                return _driver.FindElement(_errorMessageLocator).Displayed;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }

        public string GetErrorMessage()
        {
            try
            {
                return _driver.FindElement(_errorMessageLocator).Text;
            }
            catch (NoSuchElementException)
            {
                return string.Empty;
            }
        }

        public void Login(string email, string password)
        {
            EnterEmail(email);
            EnterPassword(password);
            ClickLoginButton();
        }

        public bool IsLoggedIn()
        {
            // Check if we redirected to dashboard or courses page
            try
            {
                _wait.Until(driver => 
                    driver.Url.Contains("/courses") || 
                    driver.Url.Contains("/dashboard"));
                return true;
            }
            catch (WebDriverTimeoutException)
            {
                return false;
            }
        }
    }
}
