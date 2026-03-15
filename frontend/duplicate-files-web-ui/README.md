# Duplicate Files Web UI

A modern, responsive web interface for managing duplicate files. Built with Next.js 14, React 18, and TypeScript.

## Features

- **Two-Column Layout**: Clear separation between unique and duplicate files
- **Visual Relationship Indicators**: Hover highlighting to show connections between unique files and their duplicates
- **Bulk Operations**: Select and delete multiple duplicate files at once
- **Real-time Feedback**: Loading states, success/error notifications, and optimistic UI updates
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Accessibility**: WCAG AA compliant with keyboard navigation and screen reader support
- **Error Handling**: Comprehensive error handling with retry functionality

## Prerequisites

- Node.js 18+ or higher
- npm or yarn package manager
- Spring Boot backend API running (see backend documentation)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Backend API base URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api
```

### Environment Variable Details

- `NEXT_PUBLIC_API_BASE_URL`: The base URL of your Spring Boot backend API
  - Default: `http://localhost:8080/api`
  - Production example: `https://api.yourdomain.com/api`

## Installation

1. Clone the repository and navigate to the frontend directory:

```bash
cd frontend/duplicate-files-web-ui
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create your `.env.local` file with the required environment variables (see above)

## Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

The page will auto-reload when you make changes to the code.

## Testing

Run the test suite:

```bash
npm test
# or
yarn test
```

Run tests in watch mode:

```bash
npm test -- --watch
# or
yarn test --watch
```

Run tests with coverage:

```bash
npm test -- --coverage
# or
yarn test --coverage
```

## Building for Production

Build the application for production:

```bash
npm run build
# or
yarn build
```

This will create an optimized production build in the `.next` directory.

### Testing the Production Build

After building, you can test the production build locally:

```bash
npm start
# or
yarn start
```

## Deployment

### Vercel (Recommended)

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com):

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy

### Docker

Build and run with Docker:

```bash
# Build the Docker image
docker build -t duplicate-files-web-ui .

# Run the container
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=http://your-api-url duplicate-files-web-ui
```

### Other Platforms

This Next.js application can be deployed to any platform that supports Node.js:

- AWS Amplify
- Netlify
- Railway
- Render
- Self-hosted with PM2 or similar

Refer to the [Next.js deployment documentation](https://nextjs.org/docs/deployment) for detailed instructions.

## Backend Integration

### CORS Configuration

The Spring Boot backend must be configured to allow requests from the frontend origin. Add the following CORS configuration to your backend:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "https://your-production-domain.com")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

### API Endpoints

The frontend expects the following API endpoints:

- `GET /api/analysis` - Retrieve duplicate file analysis
- `DELETE /api/files` - Delete a single file
- `DELETE /api/files/bulk` - Delete multiple files

Refer to the backend API documentation for detailed endpoint specifications.

## Project Structure

```
frontend/duplicate-files-web-ui/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main page component
│   └── globals.css          # Global styles
├── components/              # React components
│   ├── ColumnHeader.tsx     # Column header with actions
│   ├── DuplicateGroup.tsx   # Duplicate file group
│   ├── ErrorBoundary.tsx    # Error boundary component
│   ├── FileCard.tsx         # Individual file card
│   ├── NotificationContainer.tsx  # Notification manager
│   ├── NotificationToast.tsx      # Toast notification
│   └── TwoColumnLayout.tsx  # Main layout component
├── lib/                     # Utility libraries
│   └── api/                 # API client
│       └── duplicateFilesAPI.ts
├── types/                   # TypeScript type definitions
│   └── index.ts
├── __tests__/              # Test files
├── .env.local              # Environment variables (create this)
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies and scripts
├── tailwind.config.ts      # Tailwind CSS configuration
└── tsconfig.json           # TypeScript configuration
```

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API (native)
- **State Management**: React hooks (useState, useReducer)
- **Testing**: Jest + React Testing Library + fast-check (property-based testing)
- **Build Tool**: Next.js built-in (Turbopack)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Accessibility

This application follows WCAG 2.1 Level AA guidelines:

- Keyboard navigation support
- Screen reader compatibility
- Focus indicators on all interactive elements
- Proper ARIA labels and roles
- Color contrast ratios meet AA standards
- Skip-to-main-content link

## Performance

- Code splitting and lazy loading
- Optimized images with Next.js Image component
- Compressed assets in production
- React Compiler for automatic optimizations

## Troubleshooting

### Cannot connect to backend

- Verify the backend is running and accessible
- Check the `NEXT_PUBLIC_API_BASE_URL` environment variable
- Ensure CORS is properly configured on the backend
- Check browser console for network errors

### Build fails

- Clear the `.next` directory: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Verify Node.js version is 18 or higher: `node --version`

### Tests fail

- Ensure all dependencies are installed: `npm install`
- Clear Jest cache: `npm test -- --clearCache`
- Check for TypeScript errors: `npm run type-check`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -am 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Submit a pull request

## License

[Your License Here]

## Support

For issues and questions, please open an issue on the GitHub repository.
