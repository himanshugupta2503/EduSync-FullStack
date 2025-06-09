using EduSync.UITests.PageObjects;
using NUnit.Framework;
using System.Threading;

namespace EduSync.UITests.Tests
{
    [TestFixture]
    public class CourseListTests : BaseTest
    {
        private LoginPage _loginPage;
        private CoursesPage _coursesPage;

        [SetUp]
        public override void SetUp()
        {
            base.SetUp();
            _loginPage = new LoginPage(Driver);
            _coursesPage = new CoursesPage(Driver);
            
            // Login as instructor before testing courses
            _loginPage.NavigateTo(BaseUrl);
            _loginPage.Login("instructor@example.com", "Password123!");
            
            // Navigate to courses page
            _coursesPage.NavigateTo(BaseUrl);
        }

        [Test]
        public void CoursesPage_ShouldDisplayCourses()
        {
            // Verify that the courses page is displayed
            Assert.That(_coursesPage.IsCoursesPageDisplayed(), Is.True, "Courses page should be displayed after navigation");
            
            // Check that at least one course is displayed
            // This assumes there are courses in the database
            Assert.That(_coursesPage.GetCourseCount(), Is.GreaterThan(0), "At least one course should be visible");
        }

        [Test]
        public void SearchCourse_ShouldFilterResults()
        {
            // Store initial course count
            int initialCount = _coursesPage.GetCourseCount();
            
            // Search for a specific course (use a title that exists in your test data)
            string searchText = "Python"; // Replace with a known course title
            _coursesPage.SearchCourse(searchText);
            
            // Wait for the search results to update
            Thread.Sleep(1000);
            
            // Verify search results - either found fewer courses or found specifically the right course
            int searchResultCount = _coursesPage.GetCourseCount();
            Assert.That(searchResultCount, Is.LessThanOrEqualTo(initialCount), 
                "Search should filter courses or return same number if all match");
        }

        [Test]
        public void InstructorView_ShouldShowCreateCourseButton()
        {
            // Since we're logged in as an instructor, check if create course button is visible
            Assert.That(_coursesPage.IsCreateCourseButtonVisible(), Is.True, 
                "Create course button should be visible for instructors");
        }

        [Test]
        public void CourseCards_ShouldBeClickable()
        {
            // Skip test if no courses are displayed
            if (_coursesPage.GetCourseCount() == 0)
            {
                Assert.Ignore("No courses available to test clicking");
            }
            
            // Click on the first course (this is an integration test approach)
            // In a real scenario, you would have control over test data
            _coursesPage.ClickCourseByTitle(""); // Will click first course when empty
            
            // Verify we navigated to a course detail page
            Assert.That(Driver.Url.Contains("/courses/"), Is.True, 
                "Clicking course should navigate to course detail page");
        }
    }
}
