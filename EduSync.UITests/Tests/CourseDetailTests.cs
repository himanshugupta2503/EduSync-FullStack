using EduSync.UITests.PageObjects;
using NUnit.Framework;
using System;
using System.Threading;
using OpenQA.Selenium;

namespace EduSync.UITests.Tests
{
    [TestFixture]
    public class CourseDetailTests : BaseTest
    {
        private LoginPage _loginPage;
        private CoursesPage _coursesPage;
        private CourseDetailPage _courseDetailPage;
        private string _existingCourseTitle = "Test Automation Course"; // Change to a course title that exists in your system

        [SetUp]
        public override void SetUp()
        {
            base.SetUp();
            _loginPage = new LoginPage(Driver);
            _coursesPage = new CoursesPage(Driver);
            _courseDetailPage = new CourseDetailPage(Driver);
            
            // Login as instructor
            _loginPage.NavigateTo(BaseUrl);
            _loginPage.Login("instructor@example.com", "Password123!");
            
            // Navigate to courses page
            _coursesPage.NavigateTo(BaseUrl);
        }

        [Test]
        public void CourseDetail_DisplaysCorrectInformation()
        {
            // Skip test if no courses are available
            if (_coursesPage.GetCourseCount() == 0)
            {
                Assert.Ignore("No courses available to test");
                return;
            }

            try
            {
                // Try to find the specified test course
                _coursesPage.ClickCourseByTitle(_existingCourseTitle);
            }
            catch (NoSuchElementException)
            {
                // If not found, click the first available course
                _coursesPage.ClickCourseByTitle(""); // Empty string will click first course
            }

            // Verify we're on the course detail page
            Assert.That(_courseDetailPage.IsCourseDetailPageDisplayed(), Is.True, 
                "Course detail page should be displayed after clicking a course");
            
            // Verify course information is displayed
            Assert.That(_courseDetailPage.GetCourseTitle(), Is.Not.Empty, "Course title should be displayed");
            Assert.That(_courseDetailPage.GetCourseDescription(), Is.Not.Empty, "Course description should be displayed");
        }

        [Test]
        public void InstructorOwnedCourse_ShowsEditAndDeleteButtons()
        {
            // This test assumes you're logged in as an instructor who owns at least one course
            // Navigate to courses page
            _coursesPage.NavigateTo(BaseUrl);
            
            // Skip test if no courses are available
            if (_coursesPage.GetCourseCount() == 0)
            {
                Assert.Ignore("No courses available to test");
                return;
            }

            try
            {
                // Try to navigate to a course that the instructor owns
                _coursesPage.ClickCourseByTitle(_existingCourseTitle);
            }
            catch (NoSuchElementException)
            {
                // If the specific course isn't found, click the first course
                // This assumes the first course is owned by the logged-in instructor
                _coursesPage.ClickCourseByTitle("");
            }

            // Check if edit and delete buttons are displayed for the instructor's own course
            // Note: This test may fail if the first course isn't owned by the instructor
            bool editVisible = _courseDetailPage.IsEditButtonDisplayed();
            bool deleteVisible = _courseDetailPage.IsDeleteButtonDisplayed();
            
            Assert.That(editVisible || deleteVisible, Is.True, 
                "Either edit or delete button should be visible for instructor's own course");
        }

        [Test]
        public void DeleteCourse_ShowsConfirmationDialog()
        {
            // Skip this test if you don't want to actually delete courses during testing
            // You might want to create test data specifically for this purpose
            
            // Navigate to courses page
            _coursesPage.NavigateTo(BaseUrl);
            
            // Skip test if no courses are available
            if (_coursesPage.GetCourseCount() == 0)
            {
                Assert.Ignore("No courses available to test deletion");
                return;
            }

            try
            {
                // Navigate to a course that the instructor owns
                _coursesPage.ClickCourseByTitle(_existingCourseTitle);
            }
            catch (NoSuchElementException)
            {
                // If the specific course isn't found, click the first course
                _coursesPage.ClickCourseByTitle("");
            }

            // Skip test if delete button is not available (not owned by current user)
            if (!_courseDetailPage.IsDeleteButtonDisplayed())
            {
                Assert.Ignore("Delete button not available - course likely not owned by current user");
                return;
            }

            // Click delete button
            _courseDetailPage.ClickDeleteButton();
            
            // Check if confirmation dialog is displayed by seeing if cancel button is available
            try
            {
                _courseDetailPage.CancelDelete();
                // If we get here, the cancel button was found and clicked, so test passed
                Assert.Pass("Delete confirmation dialog was displayed and cancel was clicked");
            }
            catch (Exception)
            {
                Assert.Fail("Delete confirmation dialog did not appear or cancel button not found");
            }
        }

        [Test, Explicit("This test actually deletes a course - use with caution")]
        public void DeleteCourse_CompleteDeletion()
        {
            // This test is marked Explicit because it permanently deletes data
            // Run this only in test environments with disposable data
            
            // Navigate to courses page
            _coursesPage.NavigateTo(BaseUrl);
            
            // Store initial course count
            int initialCount = _coursesPage.GetCourseCount();
            
            // Skip test if no courses are available
            if (initialCount == 0)
            {
                Assert.Ignore("No courses available to test deletion");
                return;
            }

            try
            {
                // Navigate to a course that the instructor owns
                _coursesPage.ClickCourseByTitle(_existingCourseTitle);
            }
            catch (NoSuchElementException)
            {
                // If the specific course isn't found, click the first course
                _coursesPage.ClickCourseByTitle("");
            }

            // Skip test if delete button is not available (not owned by current user)
            if (!_courseDetailPage.IsDeleteButtonDisplayed())
            {
                Assert.Ignore("Delete button not available - course likely not owned by current user");
                return;
            }

            // Delete the course
            _courseDetailPage.DeleteCourse();
            
            // Check if toast notification is displayed
            bool toastShown = !string.IsNullOrEmpty(_courseDetailPage.GetToastMessage());
            Assert.That(toastShown, Is.True, "Success toast should be displayed after deletion");
            
            // Verify we were redirected to the courses page
            Thread.Sleep(1000); // Give time for navigation
            Assert.That(_coursesPage.IsCoursesPageDisplayed(), Is.True, 
                "Should be redirected to courses page after deletion");
                
            // Verify course count decreased
            int newCount = _coursesPage.GetCourseCount();
            Assert.That(newCount, Is.LessThan(initialCount), 
                "Course count should decrease after deletion");
        }
    }
}
