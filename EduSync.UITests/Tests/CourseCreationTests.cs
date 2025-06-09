using EduSync.UITests.PageObjects;
using NUnit.Framework;
using System;
using System.IO;

namespace EduSync.UITests.Tests
{
    [TestFixture]
    public class CourseCreationTests : BaseTest
    {
        private LoginPage _loginPage;
        private CoursesPage _coursesPage;
        private CourseFormPage _courseFormPage;
        private CourseDetailPage _courseDetailPage;
        
        [SetUp]
        public override void SetUp()
        {
            base.SetUp();
            _loginPage = new LoginPage(Driver);
            _coursesPage = new CoursesPage(Driver);
            _courseFormPage = new CourseFormPage(Driver);
            _courseDetailPage = new CourseDetailPage(Driver);
            
            // Login as instructor before testing course creation
            _loginPage.NavigateTo(BaseUrl);
            _loginPage.Login("instructor@example.com", "Password123!");
        }

        [Test]
        public void CreateCourse_WithValidData_ShouldSucceed()
        {
            // Navigate to course creation form
            _coursesPage.NavigateTo(BaseUrl);
            _coursesPage.ClickCreateCourse();
            
            // Generate unique course title to avoid conflicts
            string uniqueTitle = $"Test Course {DateTime.Now:yyyyMMddHHmmss}";
            
            // Create course with valid data
            _courseFormPage.CreateCourse(
                title: uniqueTitle,
                description: "This is a test course created by automated UI testing.",
                youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" // Valid YouTube URL
            );
            
            // Verify course was created successfully
            Assert.That(_courseFormPage.IsSubmissionSuccessful(), Is.True, 
                "Course should be created successfully with valid data");
                
            // Verify we're on the course detail page and the title is correct
            Assert.That(_courseDetailPage.GetCourseTitle(), Is.EqualTo(uniqueTitle),
                "Course detail page should display the correct title");
        }

        [Test]
        public void CreateCourse_WithEmptyTitle_ShouldShowValidationError()
        {
            // Navigate to course creation form
            _coursesPage.NavigateTo(BaseUrl);
            _coursesPage.ClickCreateCourse();
            
            // Attempt to create course with empty title
            _courseFormPage.CreateCourse(
                title: "", // Empty title
                description: "This is a test course with empty title."
            );
            
            // Verify validation error is shown
            Assert.That(_courseFormPage.AreValidationErrorsDisplayed(), Is.True,
                "Validation error should be displayed for empty course title");
                
            // Verify we're still on the create course page
            Assert.That(Driver.Url.Contains("/courses/create"), Is.True,
                "User should remain on course creation page after validation error");
        }

        [Test]
        public void CreateCourse_WithFileUpload_ShouldSucceed()
        {
            // Skip if we can't create a test file for upload
            string testFilePath = Path.Combine(Path.GetTempPath(), "test_file.pdf");
            try
            {
                // Create a small test file for upload
                File.WriteAllText(testFilePath, "Test content for file upload");
            }
            catch (Exception ex)
            {
                Assert.Ignore($"Could not create test file: {ex.Message}");
                return;
            }
            
            // Navigate to course creation form
            _coursesPage.NavigateTo(BaseUrl);
            _coursesPage.ClickCreateCourse();
            
            // Generate unique course title
            string uniqueTitle = $"File Upload Course {DateTime.Now:yyyyMMddHHmmss}";
            
            // Create course with file upload
            _courseFormPage.CreateCourse(
                title: uniqueTitle,
                description: "This is a test course with file upload.",
                filePath: testFilePath
            );
            
            // Clean up test file
            try
            {
                if (File.Exists(testFilePath))
                {
                    File.Delete(testFilePath);
                }
            }
            catch
            {
                // Ignore cleanup errors
            }
            
            // Verify course was created successfully
            Assert.That(_courseFormPage.IsSubmissionSuccessful(), Is.True,
                "Course should be created successfully with file upload");
        }

        [Test]
        public void CreateCourse_WithInvalidYouTubeUrl_ShouldShowError()
        {
            // Navigate to course creation form
            _coursesPage.NavigateTo(BaseUrl);
            _coursesPage.ClickCreateCourse();
            
            // Generate unique course title
            string uniqueTitle = $"Invalid YouTube URL Course {DateTime.Now:yyyyMMddHHmmss}";
            
            // Create course with invalid YouTube URL
            _courseFormPage.CreateCourse(
                title: uniqueTitle,
                description: "This is a test course with invalid YouTube URL.",
                youtubeUrl: "https://invalid-url.com/not-youtube" // Invalid YouTube URL
            );
            
            // Verify validation error or toast notification about invalid URL
            bool hasValidationError = _courseFormPage.AreValidationErrorsDisplayed();
            string toastMessage = _courseFormPage.GetToastMessage();
            
            Assert.That(hasValidationError || toastMessage.Contains("invalid"), Is.True,
                "Validation error or toast notification should indicate invalid YouTube URL");
        }
    }
}
