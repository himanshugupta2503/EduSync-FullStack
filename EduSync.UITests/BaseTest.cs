using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using WebDriverManager;
using WebDriverManager.DriverConfigs.Impl;
using System;

namespace EduSync.UITests
{
    public class BaseTest
    {
        protected IWebDriver Driver { get; private set; }
        protected WebDriverWait Wait { get; private set; }
        
        // Base URL for the application
        protected string BaseUrl = "http://localhost:3000"; // Update this with your frontend URL

        [SetUp]
        public virtual void SetUp()
        {
            // Setup WebDriver using WebDriverManager
            new DriverManager().SetUpDriver(new ChromeConfig());
            
            // Initialize Chrome driver with options
            var options = new ChromeOptions();
            
            // Uncomment the line below for headless testing
            // options.AddArgument("--headless");
            
            options.AddArgument("--no-sandbox");
            options.AddArgument("--disable-dev-shm-usage");
            options.AddArgument("--disable-gpu");
            options.AddArgument("--window-size=1920,1080");
            
            Driver = new ChromeDriver(options);
            Driver.Manage().Window.Maximize();
            Driver.Manage().Timeouts().ImplicitWait = TimeSpan.FromSeconds(10);
            
            // Initialize WebDriverWait with 10 seconds timeout
            Wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(10));
            
            // Navigate to base URL
            Driver.Navigate().GoToUrl(BaseUrl);
        }

        [TearDown]
        public virtual void TearDown()
        {
            Driver?.Quit();
        }
        
        // Helper methods for common operations
        protected void NavigateTo(string url)
        {
            Driver.Navigate().GoToUrl(BaseUrl + url);
        }
        
        protected IWebElement WaitForElement(By by)
        {
            return Wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementIsVisible(by));
        }
        
        protected IWebElement WaitForElementClickable(By by)
        {
            return Wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementToBeClickable(by));
        }
        
        protected bool IsElementPresent(By by)
        {
            try
            {
                Driver.FindElement(by);
                return true;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }
    }
}
