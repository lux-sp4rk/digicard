import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RichTextRenderer from '../../src/components/RichTextRenderer';

// Mock renderMarkdown to avoid needing the actual implementation
vi.mock('../../src/utils/stringUtils', () => ({
  renderMarkdown: vi.fn(text => `<p>${text}</p>`),
}));

describe('RichTextRenderer', () => {
  describe('null/undefined handling', () => {
    it('returns null when description is null', () => {
      const { container } = render(<RichTextRenderer description={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('returns null when description is undefined', () => {
      const { container } = render(
        <RichTextRenderer description={undefined} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('returns null when description is empty string', () => {
      const { container } = render(<RichTextRenderer description="" />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('plain string description', () => {
    it('renders plain string as Markdown HTML', () => {
      render(<RichTextRenderer description="Hello world" theme="dark" />);
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });
  });

  describe('embedded asset rendering', () => {
    const createEmbeddedAssetNode = assetFields => ({
      nodeType: 'document',
      data: {},
      content: [
        {
          nodeType: 'embedded-asset-block',
          data: {
            target: {
              sys: { id: 'asset-1', type: 'Asset' },
              fields: assetFields,
            },
          },
          content: [],
        },
      ],
    });

    it('renders embedded image asset as img with correct src and alt', () => {
      const richTextDoc = createEmbeddedAssetNode({
        file: {
          url: '//images.ctfassets.net/example/image.jpg',
          contentType: 'image/jpeg',
          fileName: 'test-image.jpg',
        },
        title: 'Test Image',
        description: 'A test image',
      });

      render(<RichTextRenderer description={richTextDoc} />);

      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute(
        'src',
        'https://images.ctfassets.net/example/image.jpg'
      );
      expect(img).toHaveAttribute('alt', 'A test image');
      expect(img).toHaveClass('max-w-full', 'h-auto', 'rounded-lg', 'my-4');
    });

    it('uses title as alt when description is missing', () => {
      const richTextDoc = createEmbeddedAssetNode({
        file: {
          url: '//images.ctfassets.net/example/image.jpg',
          contentType: 'image/jpeg',
          fileName: 'test-image.jpg',
        },
        title: 'My Image Title',
        description: '',
      });

      render(<RichTextRenderer description={richTextDoc} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'My Image Title');
    });

    it('uses fileName as alt when both description and title are missing', () => {
      const richTextDoc = createEmbeddedAssetNode({
        file: {
          url: '//images.ctfassets.net/example/image.jpg',
          contentType: 'image/jpeg',
          fileName: 'fallback-filename.jpg',
        },
        title: '',
        description: '',
      });

      render(<RichTextRenderer description={richTextDoc} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('alt', 'fallback-filename.jpg');
    });

    it('filters out non-image assets (PDF) and returns null', () => {
      const richTextDoc = createEmbeddedAssetNode({
        file: {
          url: '//assets.ctfassets.net/example/document.pdf',
          contentType: 'application/pdf',
          fileName: 'document.pdf',
        },
        title: 'PDF Document',
        description: 'A PDF file',
      });

      render(<RichTextRenderer description={richTextDoc} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.queryByText('PDF Document')).not.toBeInTheDocument();
    });

    it('filters out non-image assets (video) and returns null', () => {
      const richTextDoc = createEmbeddedAssetNode({
        file: {
          url: '//assets.ctfassets.net/example/video.mp4',
          contentType: 'video/mp4',
          fileName: 'video.mp4',
        },
        title: 'Video',
        description: 'A video file',
      });

      render(<RichTextRenderer description={richTextDoc} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(screen.queryByText('Video')).not.toBeInTheDocument();
    });

    it('handles node with missing asset data gracefully', () => {
      const richTextDoc = {
        nodeType: 'document',
        data: {},
        content: [
          {
            nodeType: 'embedded-asset-block',
            data: {
              target: null,
            },
            content: [],
          },
        ],
      };

      render(<RichTextRenderer description={richTextDoc} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('handles node with missing file field gracefully', () => {
      const richTextDoc = {
        nodeType: 'document',
        data: {},
        content: [
          {
            nodeType: 'embedded-asset-block',
            data: {
              target: {
                fields: {
                  title: 'No File',
                },
              },
            },
            content: [],
          },
        ],
      };

      render(<RichTextRenderer description={richTextDoc} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('handles node with missing url field gracefully', () => {
      const richTextDoc = createEmbeddedAssetNode({
        file: {
          contentType: 'image/jpeg',
          fileName: 'image.jpg',
        },
        title: 'No URL',
        description: '',
      });

      render(<RichTextRenderer description={richTextDoc} />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
    });

    it('calls onError handler when image fails to load', () => {
      const consoleWarnSpy = vi
        .spyOn(console, 'warn')
        .mockImplementation(() => {});

      const richTextDoc = createEmbeddedAssetNode({
        file: {
          url: '//images.ctfassets.net/example/broken.jpg',
          contentType: 'image/jpeg',
          fileName: 'broken.jpg',
        },
        title: 'Broken Image',
        description: 'An image that will fail to load',
      });

      render(<RichTextRenderer description={richTextDoc} />);

      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();

      // Simulate image error using fireEvent
      fireEvent.error(img);

      // The img should be hidden (display: none) after error
      expect(img.style.display).toBe('none');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to load embedded image')
      );

      consoleWarnSpy.mockRestore();
    });

    it('handles absolute URL (https://) correctly', () => {
      const richTextDoc = createEmbeddedAssetNode({
        file: {
          url: 'https://images.ctfassets.net/example/image.jpg',
          contentType: 'image/jpeg',
          fileName: 'test.jpg',
        },
        title: 'Absolute URL Image',
        description: '',
      });

      render(<RichTextRenderer description={richTextDoc} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute(
        'src',
        'https://images.ctfassets.net/example/image.jpg'
      );
    });

    it('handles URL without protocol correctly', () => {
      const richTextDoc = createEmbeddedAssetNode({
        file: {
          url: 'images.ctfassets.net/example/image.jpg',
          contentType: 'image/jpeg',
          fileName: 'test.jpg',
        },
        title: 'No Protocol Image',
        description: '',
      });

      render(<RichTextRenderer description={richTextDoc} />);

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute(
        'src',
        'https://images.ctfassets.net/example/image.jpg'
      );
    });
  });
});
