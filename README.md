# 🖼️ ImageLens Pro - ClearAI

**ImageLens Pro** is an intelligent, web-based platform designed for the automated detection and correction of errors within images. Leveraging powerful AI, it identifies various issues—from spelling and grammar to contextual mistakes—and presents them in a clear, interactive, and user-friendly interface.

This platform is ideal for quality assurance in content creation, ensuring that visual materials are polished and error-free before publication.

---

## ✨ Key Features

-   🔐 **Secure Authentication**: Robust user management with options for email/password and Google OAuth sign-in.
-   🛡️ **Admin-Managed Access**: A built-in workflow where administrators must approve new account requests before users can log in.
-   👨‍💼 **Admin Dashboard**: A dedicated interface for administrators to manage user accounts and review account requests.
-   📤 **Effortless Image Upload**: A modern drag-and-drop interface for easy image submission.
-   🤖 **AI-Powered Analysis**: Utilizes Google's Gemini Vision API to automatically detect a variety of errors in uploaded images.
-   🎯 **Interactive Bounding Boxes**: Errors are highlighted directly on the image with interactive boxes. Hover over any box to see detailed information about the error and suggested corrections.
-   🎨 **Color-Coded Error Types**: Errors are categorized and color-coded for quick identification:
    -   🔴 **Spelling**: Red highlights
    -   🟠 **Grammar**: Orange highlights
    -   🟡 **Spacing**: Yellow highlights
    -   🔵 **Context**: Blue highlights
    -   🟢 **Suggestions**: Green highlights
-   📊 **User Dashboard**: A personal space for users to view and manage all their analyzed images.

---

## 🚀 Tech Stack

-   **Frontend**: [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
-   **UI Framework**: [shadcn/ui](https://ui.shadcn.com/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Backend & Database**: [Supabase](https://supabase.io/)
-   **Authentication**: [Supabase Auth](https://supabase.com/docs/guides/auth)
-   **Storage**: [Supabase Storage](https://supabase.com/docs/guides/storage)

---

## ⚙️ Getting Started

Follow these instructions to get a local copy of the project up and running for development and testing purposes.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or newer)
-   [pnpm](https://pnpm.io/installation) package manager
-   A [Supabase](https://supabase.io/) account to set up the database and authentication.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/SahilCharan/ImageLensPro---ClearAI.git
    cd ImageLensPro---ClearAI
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Set up Supabase:**
    -   Create a new project on [Supabase](https://app.supabase.io/).
    -   Navigate to the **SQL Editor** in your Supabase project.
    -   Copy the entire content of `supabase/migrations/20250107_create_complete_schema.sql` and run it to set up your database tables, policies, and functions.

4.  **Configure Environment Variables:**
    -   Create a new file named `.env` in the root of the project.
    -   Go to your Supabase project's **Settings > API**.
    -   Copy the **Project URL** and **`anon` public key** into your `.env` file like this:

    ```env
    VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL
    VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    ```

5.  **Run the development server:**
    The original run script is `lint`. You may want to change the `dev` script in `package.json` to `vite` to run the development server.
    ```bash
    # Recommended: Change the "dev" script in package.json to "vite"
    pnpm run dev
    ```
    The application should now be running on `http://localhost:5173` (or another port if 5173 is in use).

---

## 📖 Usage

1.  **Request an Account**: New users must first request an account.
2.  **Admin Approval**: An administrator must approve the request from the Admin Dashboard.
3.  **Login**: Once approved, sign in with your credentials or Google.
4.  **Upload**: Navigate to the upload page and drop an image for analysis.
5.  **Review**: The system will process the image and redirect you to the analysis page, where you can review the highlighted errors.
6.  **Dashboard**: Visit your dashboard to see a history of all your uploaded images.

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.