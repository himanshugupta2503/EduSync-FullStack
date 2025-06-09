using System;
using System.Collections.Generic;
using System.Linq;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace EduSync.UITests.PageObjects
{
    public class CoursesPage
    {
        private readonly IWebDriver _driver;
        private readonly WebDriverWait _wait;

        // Locators
        private readonly By _courseCardsLocator = By.CssSelector(".course-card");
        private readonly By _searchInputLocator = By.Id("searchInput");
        private readonly By _createCourseButtonLocator = By.CssSelector("a[href='/courses/create']");
        private readonly By _courseDeleteButtonLocator = By.CssSelector(".delete-course-btn");
        private readonly By _confirmDeleteButtonLocator = By.CssSelector(".modal .btn-danger");
        private readonly By _cancelDeleteButtonLocator = By.CssSelector(".modal .btn-secondary");
        private readonly By _toastNotificationLocator = By.CssSelector(".Toastify__toast-body");
        private readonly By _loadingSpinnerLocator = By.CssSelector(".spinner-border");

        public CoursesPage(IWebDriver driver)
        {
            _driver = driver;
            _wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
        }

        public void NavigateTo(string baseUrl)
        {
            _driver.Navigate().GoToUrl(baseUrl + "/courses");
        }

        public bool IsCoursesPageDisplayed()
        {
            try
            {
                return _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.UrlContains("/courses"));
            }
            catch
            {
                return false;
            }
        }

        public int GetCourseCount()
        {
            try
            {
                return _driver.FindElements(_courseCardsLocator).Count;
            }
            catch
            {
                return 0;
            }
        }

        public void SearchCourse(string searchText)
        {
            var searchInput = _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementIsVisible(_searchInputLocator));
            searchInput.Clear();
            searchInput.SendKeys(searchText);
        }

        public void ClickCreateCourse()
        {
            _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementToBeClickable(_createCourseButtonLocator)).Click();
        }

        public bool IsCreateCourseButtonVisible()
        {
            try
            {
                return _driver.FindElement(_createCourseButtonLocator).Displayed;
            }
            catch
            {
                return false;
            }
        }

        public void ClickCourseByTitle(string title)
        {
            var courses = _driver.FindElements(_courseCardsLocator);
            foreach (var course in courses)
            {
                if (course.Text.Contains(title))
                {
                    // Click on the course card, not the delete button
                    var cardLink = course.FindElement(By.CssSelector("a"));
                    cardLink.Click();
                    return;
                }
            }
            throw new NoSuchElementException($"Could not find course with title '{title}'");
        }

        public void DeleteCourseByTitle(string title)
        {
            // Find the course card containing the title
            var courses = _driver.FindElements(_courseCardsLocator);
            foreach (var course in courses)
            {
                if (course.Text.Contains(title))
                {
                    // Find and click the delete button within this course card
                    var deleteButton = course.FindElement(_courseDeleteButtonLocator);
                    deleteButton.Click();
                    
                    // Wait for the confirmation modal
                    _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementIsVisible(_confirmDeleteButtonLocator));
                    
                    // Click the confirm delete button
                    _driver.FindElement(_confirmDeleteButtonLocator).Click();
                    
                    // Wait for the toast notification or spinner to disappear
                    _wait.Until(driver => {
                        try {
                            var spinners = driver.FindElements(_loadingSpinnerLocator);
                            return spinners.Count == 0 || !spinners[0].Displayed;
                        }
                        catch {
                            return true;
                        }
                    });
                    
                    return;
                }
            }
            throw new NoSuchElementException($"Could not find course with title '{title}'");
        }

        public void CancelDeleteCourseByTitle(string title)
        {
            // Find the course card containing the title
            var courses = _driver.FindElements(_courseCardsLocator);
            foreach (var course in courses)
            {
                if (course.Text.Contains(title))
                {
                    // Find and click the delete button within this course card
                    var deleteButton = course.FindElement(_courseDeleteButtonLocator);
                    deleteButton.Click();
                    
                    // Wait for the confirmation modal
                    _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementIsVisible(_cancelDeleteButtonLocator));
                    
                    // Click the cancel button
                    _driver.FindElement(_cancelDeleteButtonLocator).Click();
                    return;
                }
            }
            throw new NoSuchElementException($"Could not find course with title '{title}'");
        }

        public bool IsToastDisplayed()
        {
            try
            {
                return _wait.Until(SeleniumExtras.WaitHelpers.ExpectedConditions.ElementIsVisible(_toastNotificationLocator)).Displayed;
            }
            catch
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
            catch
            {
                return string.Empty;
            }
        }
        public void ClickFirstCourse()
        {
            var courses = _driver.FindElements(_courseCardsLocator);
            if (courses.Count == 0)
                throw new NoSuchElementException("No courses found to click.");
            // Click the first course card's link
            var cardLink = courses[0].FindElement(By.CssSelector("a"));
            cardLink.Click();
        }
    }
}
