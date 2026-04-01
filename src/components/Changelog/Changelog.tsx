import Markdown from "react-markdown";

export const Changelog = () => {
    const markdown = `
# 🚀 New Features & Updates coming soon

### 1. User Profile Management
- Added support for profile pictures  
- Users can now add and manage social media links  

### 2. User & Permission Management
- Introduced user grouping functionality  
- Fine-grained permission controls for detailed access management  

### 3. Video Support
- Enabled video uploads in:
  - Gallery  
  - Blogs  

### 4. Comment Service
- Visitors can now add comments on:
  - Published galleries  
  - Blog posts  

### 5. Organization Details Update
- Expanded options to manage organization-related information  

### 6. Multi-language Support
- Application now supports multiple languages for broader accessibility  

### 7. Theme Support
- Added:
  - Dark mode  
  - Light mode  

### 8. Analytics Application
- Introduced a new analytics module to manage and track system insights  


> ⚠️ **Note:** These features will be released sequentially starting from the end of April.
        `;
    return (
        <div className="markdown">
            <Markdown>{markdown}</Markdown>
        </div>
    );
};
