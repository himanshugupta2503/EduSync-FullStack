import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4 mt-auto">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h5>EduSync LMS</h5>
            <p className="text-muted">
              Smart Learning Management & Assessment Platform
            </p>
          </div>
          <div className="col-md-3">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-decoration-none text-light">Home</a></li>
              <li><a href="/courses" className="text-decoration-none text-light">Courses</a></li>
              <li><a href="/about" className="text-decoration-none text-light">About</a></li>
              <li><a href="/contact" className="text-decoration-none text-light">Contact</a></li>
            </ul>
          </div>
          <div className="col-md-3">
            <h5>Support</h5>
            <ul className="list-unstyled">
              <li><a href="/faq" className="text-decoration-none text-light">FAQ</a></li>
              <li><a href="/help" className="text-decoration-none text-light">Help Center</a></li>
              <li><a href="/privacy" className="text-decoration-none text-light">Privacy Policy</a></li>
              <li><a href="/terms" className="text-decoration-none text-light">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <hr className="my-3" />
        <div className="row align-items-center">
          <div className="col-md-6">
            <p className="mb-0">
              &copy; {new Date().getFullYear()} EduSync. All rights reserved.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="#" className="text-decoration-none text-light">
                  <i className="bi bi-facebook fs-5"></i>
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#" className="text-decoration-none text-light">
                  <i className="bi bi-twitter fs-5"></i>
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#" className="text-decoration-none text-light">
                  <i className="bi bi-linkedin fs-5"></i>
                </a>
              </li>
              <li className="list-inline-item">
                <a href="#" className="text-decoration-none text-light">
                  <i className="bi bi-instagram fs-5"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
