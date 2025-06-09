using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;
using System;
using System.IO;
using System.Threading.Tasks;

namespace backend.Services
{
    public class BlobStorageService
    {
        private readonly BlobServiceClient _blobServiceClient;
        private readonly string _containerName;

        public BlobStorageService(IConfiguration configuration)
        {
            var connectionString = configuration["MyBlobStorage:ConnectionString"] ?? 
                throw new ArgumentNullException("Configuration is missing 'MyBlobStorage:ConnectionString'");
                
            _containerName = configuration["MyBlobStorage:ContainerName"] ?? 
                throw new ArgumentNullException("Configuration is missing 'MyBlobStorage:ContainerName'");
                
            _blobServiceClient = new BlobServiceClient(connectionString);

            // Ensure the container exists
            EnsureContainerExistsAsync().GetAwaiter().GetResult();
        }

        private async Task EnsureContainerExistsAsync()
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
        {
            try
            {
                Console.WriteLine($"BlobStorageService: Starting upload of {fileName}, size: {fileStream.Length} bytes, type: {contentType}");
                
                // Make sure we have a valid container
                var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
                await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob);
                Console.WriteLine($"BlobStorageService: Container '{_containerName}' confirmed");

                // Clean up the filename and make it unique
                var safeFileName = Path.GetFileName(fileName).Replace(" ", "_");
                var uniqueFileName = $"{Guid.NewGuid()}_{safeFileName}";
                Console.WriteLine($"BlobStorageService: Generated unique filename: {uniqueFileName}");
                
                var blobClient = containerClient.GetBlobClient(uniqueFileName);
                
                // Reset stream position
                if (fileStream.CanSeek)
                {
                    fileStream.Position = 0;
                }
                
                // Upload the file with content type
                var blobOptions = new BlobUploadOptions
                {
                    HttpHeaders = new BlobHttpHeaders { ContentType = contentType }
                };
                
                Console.WriteLine($"BlobStorageService: Uploading to blob storage...");
                await blobClient.UploadAsync(fileStream, blobOptions);
                
                var blobUrl = blobClient.Uri.ToString();
                Console.WriteLine($"BlobStorageService: Upload successful. URL: {blobUrl}");
                
                return blobUrl;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"BlobStorageService ERROR: {ex.Message}");
                Console.WriteLine($"BlobStorageService ERROR Details: {ex.StackTrace}");
                throw new Exception($"Failed to upload file to blob storage: {ex.Message}", ex);
            }
        }

        public async Task<BlobDownloadInfo> DownloadFileAsync(string blobName)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            var downloadInfo = await blobClient.DownloadAsync();
            return downloadInfo;
        }

        public async Task DeleteFileAsync(string blobName)
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            await blobClient.DeleteIfExistsAsync();
        }

        public string GetBlobNameFromUrl(string blobUrl)
        {
            var uri = new Uri(blobUrl);
            var blobName = Path.GetFileName(uri.LocalPath);
            return blobName;
        }
    }
}