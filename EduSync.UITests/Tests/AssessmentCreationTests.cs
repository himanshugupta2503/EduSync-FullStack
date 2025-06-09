using EduSync.UITests.PageObjects;
using NUnit.Framework;
using System;
using System.Threading;

namespace EduSync.UITests.Tests
{
    [TestFixture]
    public class AssessmentCreationTests : BaseTest
    {
        private LoginPage _loginPage;
        private CoursesPage _coursesPage;
        private CourseDetailPage _courseDetailPage;
        private AssessmentPage _assessmentPage;
        private string _testCourseTitle;

        [SetUp]
        public override void SetUp()
        {
            base.SetUp();
            _loginPage = new LoginPage(Driver);
            _coursesPage = new CoursesPage(Driver);
            _courseDetailPage = new CourseDetailPage(Driver);
            _assessmentPage = new AssessmentPage(Driver);
            _testCourseTitle = "Test Automation Course";
            
            // Login with instructor credentials
            _loginPage.NavigateTo(BaseUrl);
            _loginPage.Login("instructor@example.com", "Password123!");
            
            // Navigate to courses
            _coursesPage.NavigateTo(BaseUrl);
        }

        [TearDown]
        public override void TearDown()
        {
            // Optionally clean up test data
            // But leave it commented out if you want to inspect the created assessments manually
            base.TearDown();
        }

        [Test]
        public void ValidAssessment_ShouldCreateSuccessfully()
        {
            // Navigate to the test course
            _coursesPage.SearchCourse(_testCourseTitle);
            _coursesPage.ClickFirstCourse();
            
            // Go to assessments tab
            _courseDetailPage.GoToAssessmentsTab();
            
            // Get initial count of assessments
            int initialCount = _assessmentPage.GetAssessmentCount();
            
            // Create a new assessment button
            _assessmentPage.ClickCreateAssessmentButton();
            
            // Fill in assessment details
            var assessmentTitle = $"Test Assessment {DateTime.Now:yyyyMMddHHmmss}";
            _assessmentPage.CreateAssessment(
                title: assessmentTitle,
                questions: "What is the capital of France?\nWhat is 2+2?",
                maxScore: "100"
            );
            
            // Assert assessment was created
            Assert.That(_assessmentPage.IsSubmissionSuccessful(), Is.True, 
                "Assessment creation should succeed with valid inputs");
            
            // Navigate back to the assessments tab to verify count increased
            _courseDetailPage.GoToAssessmentsTab();
            Thread.Sleep(1000); // Brief pause to ensure page reloads
            Assert.That(_assessmentPage.GetAssessmentCount(), Is.GreaterThan(initialCount), 
                "Assessment count should increase after creation");
        }

        [Test]
        public void EmptyTitle_ShouldShowValidationError()
        {
            // Navigate to the test course
            _coursesPage.SearchCourse(_testCourseTitle);
            _coursesPage.ClickFirstCourse();
            
            // Go to assessments tab and click create
            _courseDetailPage.GoToAssessmentsTab();
            _assessmentPage.ClickCreateAssessmentButton();
            
            // Try to submit with empty title
            _assessmentPage.CreateAssessment(
                title: "", // Empty title
                questions: "This is a test question.",
                maxScore: "100"
            );
            
            // Check validation error is displayed
            Assert.That(_assessmentPage.AreValidationErrorsDisplayed(), Is.True, 
                "Validation errors should be displayed for empty title");
        }

        [Test]
        public void InvalidMaxScore_ShouldShowValidationError()
        {
            // Navigate to the test course
            _coursesPage.SearchCourse(_testCourseTitle);
            _coursesPage.ClickFirstCourse();
            
            // Go to assessments tab and click create
            _courseDetailPage.GoToAssessmentsTab();
            _assessmentPage.ClickCreateAssessmentButton();
            
            // Try to submit with negative max score
            _assessmentPage.CreateAssessment(
                title: $"Invalid Score Test {DateTime.Now:yyyyMMddHHmmss}",
                questions: "This is a test question.",
                maxScore: "-10" // Negative score
            );
            
            // Check validation error is displayed
            Assert.That(_assessmentPage.AreValidationErrorsDisplayed(), Is.True, 
                "Validation errors should be displayed for invalid max score");
        }

        [Test]
        public void EmptyQuestions_ShouldShowValidationError()
        {
            // Navigate to the test course
            _coursesPage.SearchCourse(_testCourseTitle);
            _coursesPage.ClickFirstCourse();
            
            // Go to assessments tab and click create
            _courseDetailPage.GoToAssessmentsTab();
            _assessmentPage.ClickCreateAssessmentButton();
            
            // Try to submit with empty questions
            _assessmentPage.CreateAssessment(
                title: $"Empty Questions Test {DateTime.Now:yyyyMMddHHmmss}",
                questions: "", // Empty questions
                maxScore: "100"
            );
            
            // Check validation error is displayed
            Assert.That(_assessmentPage.AreValidationErrorsDisplayed(), Is.True, 
                "Validation errors should be displayed for empty questions");
        }
    }
}
