using System;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace EduSync.UITests.PageObjects
{
    public class CourseDetailPage
    {
        private readonly IWebDriver _driver;
        private readonly WebDriverWait _wait;

        // Locators
        private readonly By _courseTitleLocator = By.CssSelector("h2.course-title");
        private readonly By _courseDescriptionLocator = By.CssSelector(".course-description");
        private readonly By _editButtonLocator = By.CssSelector("a.btn-primary[href*='edit']");
        private readonly By _deleteButtonLocator = By.CssSelector(".delete-course-btn");
        private readonly By _confirmDeleteButtonLocator = By.CssSelector(".modal .btn-danger");
        private readonly By _cancelDeleteButtonLocator = By.CssSelector(".modal .btn-secondary");
        private readonly By _assessmentsTabLocator = By.CssSelector("button[data-tab='assessments']");
        private readonly By _assessmentListLocator = By.CssSelector(".assessments-list .assessment-item");
        private readonly By _toastNotificationLocator = By.CssSelector(".Toastify__toast-body");
        private readonly By _loadingSpinnerLocator = By.CssSelector(".spinner-border");

        public CourseDetailPage(IWebDriver driver)
        {
            _driver = driver;
            _wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        }

        public void NavigateTo(string baseUrl, string courseId)
        {
            _driver.Navigate().GoToUrl($"{baseUrl}/courses/{courseId}");
        }

        public bool IsCourseDetailPageDisplayed()
        {
            try
            {
                return _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.UrlContains("/courses/")) &&
                       _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementIsVisible(_courseTitleLocator)).Displayed;
            }
            catch
            {
                return false;
            }
        }

        public string GetCourseTitle()
        {
            return _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementIsVisible(_courseTitleLocator)).Text;
        }

        public string GetCourseDescription()
        {
            return _driver.FindElement(_courseDescriptionLocator).Text;
        }

        public bool IsEditButtonDisplayed()
        {
            try
            {
                return _driver.FindElement(_editButtonLocator).Displayed;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }

        public bool IsDeleteButtonDisplayed()
        {
            try
            {
                return _driver.FindElement(_deleteButtonLocator).Displayed;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }

        public void ClickEditButton()
        {
            _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementToBeClickable(_editButtonLocator)).Click();
        }

        public void ClickDeleteButton()
        {
            _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementToBeClickable(_deleteButtonLocator)).Click();
        }

        public void ConfirmDelete()
        {
            _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementToBeClickable(_confirmDeleteButtonLocator)).Click();
        }

        public void CancelDelete()
        {
            _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementToBeClickable(_cancelDeleteButtonLocator)).Click();
        }

        public void GoToAssessmentsTab()
        {
            _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementToBeClickable(_assessmentsTabLocator)).Click();
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

        public void DeleteCourse()
        {
            ClickDeleteButton();
            ConfirmDelete();
            
            // Wait for the spinner to disappear (deletion in progress)
            _wait.Until(driver => {
                try {
                    var spinners = driver.FindElements(_loadingSpinnerLocator);
                    return spinners.Count == 0 || !spinners[0].Displayed;
                }
                catch {
                    return true;
                }
            });
        }

        public string GetToastMessage()
        {
            try
            {
                return _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementIsVisible(_toastNotificationLocator)).Text;
            }
            catch
            {
                return string.Empty;
            }
        }
    }
}
