using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;
using System.IO;

namespace EduSync.UITests.PageObjects
{
    public class CourseFormPage
    {
        private readonly IWebDriver _driver;
        private readonly WebDriverWait _wait;

        // Locators
        private readonly By _titleInputLocator = By.Id("title");
        private readonly By _descriptionInputLocator = By.Id("description");
        private readonly By _youtubeUrlInputLocator = By.Id("youtubeUrl");
        private readonly By _fileUploadInputLocator = By.Id("fileUpload");
        private readonly By _submitButtonLocator = By.CssSelector("button[type='submit']");
        private readonly By _testYoutubeButtonLocator = By.Id("testYoutubeButton");
        private readonly By _validationErrorsLocator = By.CssSelector(".validation-error");
        private readonly By _toastNotificationLocator = By.CssSelector(".Toastify__toast-body");
        private readonly By _mediaTypeSelectLocator = By.Id("mediaType");

        public CourseFormPage(IWebDriver driver)
        {
            _driver = driver;
            _wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        }

        public void NavigateToCreateCourse(string baseUrl)
        {
            _driver.Navigate().GoToUrl(baseUrl + "/courses/create");
        }

        public void NavigateToEditCourse(string baseUrl, string courseId)
        {
            _driver.Navigate().GoToUrl(baseUrl + $"/courses/edit/{courseId}");
        }

        public void EnterTitle(string title)
        {
            _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementIsVisible(_titleInputLocator))
                .Clear();
            _driver.FindElement(_titleInputLocator).SendKeys(title);
        }

        public void EnterDescription(string description)
        {
            _driver.FindElement(_descriptionInputLocator).Clear();
            _driver.FindElement(_descriptionInputLocator).SendKeys(description);
        }

        public void EnterYoutubeUrl(string url)
        {
            try
            {
                // First try to select YouTube media type if it exists
                var mediaTypeSelector = _driver.FindElement(_mediaTypeSelectLocator);
                var selectElement = new SelectElement(mediaTypeSelector);
                selectElement.SelectByText("YouTube");

                // Then enter the URL
                _driver.FindElement(_youtubeUrlInputLocator).Clear();
                _driver.FindElement(_youtubeUrlInputLocator).SendKeys(url);
            }
            catch (NoSuchElementException)
            {
                // If media type selector doesn't exist, just try to fill the YouTube URL field
                _driver.FindElement(_youtubeUrlInputLocator).Clear();
                _driver.FindElement(_youtubeUrlInputLocator).SendKeys(url);
            }
        }

        public void UploadFile(string filePath)
        {
            try
            {
                // First try to select File media type if it exists
                var mediaTypeSelector = _driver.FindElement(_mediaTypeSelectLocator);
                var selectElement = new SelectElement(mediaTypeSelector);
                selectElement.SelectByText("File");
            }
            catch (NoSuchElementException)
            {
                // If media type selector doesn't exist, proceed with file upload
            }

            // Make sure the file exists before attempting to upload
            if (File.Exists(filePath))
            {
                _driver.FindElement(_fileUploadInputLocator).SendKeys(filePath);
            }
            else
            {
                throw new FileNotFoundException($"Test file not found: {filePath}");
            }
        }

        public void TestYoutubeUrl()
        {
            try
            {
                _driver.FindElement(_testYoutubeButtonLocator).Click();
            }
            catch (NoSuchElementException)
            {
                // Test button might not be present in all versions of the form
            }
        }

        public void ClickSubmitButton()
        {
            _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementToBeClickable(_submitButtonLocator))
                .Click();
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

        public bool IsSubmissionSuccessful()
        {
            try
            {
                _wait.Until(driver => 
                    driver.Url.Contains("/courses/") && 
                    !driver.Url.Contains("/create") && 
                    !driver.Url.Contains("/edit"));
                return true;
            }
            catch (WebDriverTimeoutException)
            {
                return false;
            }
        }

        public void CreateCourse(string title, string description, string youtubeUrl = null, string filePath = null)
        {
            EnterTitle(title);
            EnterDescription(description);
            
            if (!string.IsNullOrEmpty(youtubeUrl))
            {
                EnterYoutubeUrl(youtubeUrl);
                TestYoutubeUrl();
            }
            else if (!string.IsNullOrEmpty(filePath))
            {
                UploadFile(filePath);
            }
            
            ClickSubmitButton();
        }
    }
}
