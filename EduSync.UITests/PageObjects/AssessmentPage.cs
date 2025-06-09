using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;
using System;

namespace EduSync.UITests.PageObjects
{
    public class AssessmentPage
    {
        private readonly IWebDriver _driver;
        private readonly WebDriverWait _wait;

        // Locators
        private readonly By _titleInputLocator = By.Id("title"); // Update to match your frontend form
        private readonly By _questionsInputLocator = By.Id("questions"); // Changed from instructions to questions
        private readonly By _maxScoreInputLocator = By.Id("maxScore");
        private readonly By _submitButtonLocator = By.CssSelector("button[type='submit']");
        private readonly By _createAssessmentButtonLocator = By.Id("createAssessmentButton");
        private readonly By _validationErrorsLocator = By.CssSelector(".validation-error");
        private readonly By _toastNotificationLocator = By.CssSelector(".Toastify__toast-body");
        private readonly By _assessmentListLocator = By.CssSelector(".assessment-item");

        public AssessmentPage(IWebDriver driver)
        {
            _driver = driver;
            _wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        }

        public void NavigateToCreateAssessment(string baseUrl, string courseId)
        {
            // This may vary based on your application's URL structure
            _driver.Navigate().GoToUrl($"{baseUrl}/courses/{courseId}/assessments/create");
        }

        public void NavigateToAssessmentTab(CourseDetailPage courseDetailPage)
        {
            // Use the CourseDetailPage to navigate to the assessments tab
            courseDetailPage.GoToAssessmentsTab();
        }

        public void ClickCreateAssessmentButton()
        {
            _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementToBeClickable(_createAssessmentButtonLocator))
                .Click();
        }

        public void EnterTitle(string title)
        {
            _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementIsVisible(_titleInputLocator))
                .Clear();
            _driver.FindElement(_titleInputLocator).SendKeys(title);
        }

        public void EnterQuestions(string questions)
        {
            _driver.FindElement(_questionsInputLocator).Clear();
            _driver.FindElement(_questionsInputLocator).SendKeys(questions);
        }

        public void EnterMaxScore(string maxScore)
        {
            _driver.FindElement(_maxScoreInputLocator).Clear();
            _driver.FindElement(_maxScoreInputLocator).SendKeys(maxScore);
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
                // Check if either redirected to course detail or a success toast is shown
                _wait.Until(driver => 
                    GetToastMessage().ToLower().Contains("success") || 
                    driver.FindElements(_assessmentListLocator).Count > 0);
                return true;
            }
            catch (WebDriverTimeoutException)
            {
                return false;
            }
        }

        public int GetAssessmentCount()
        {
            try
            {
                return _driver.FindElements(_assessmentListLocator).Count;
            }
            catch
            {
                return 0;
            }
        }

        public void CreateAssessment(string title, string questions, string maxScore)
        {
            EnterTitle(title);
            EnterQuestions(questions);
            EnterMaxScore(maxScore);
            ClickSubmitButton();
        }
    }
}
