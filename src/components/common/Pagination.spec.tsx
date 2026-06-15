import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders page navigation when totalPages is greater than 1', () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={jest.fn()} />,
    );

    expect(screen.getByLabelText('Pagination')).toBeInTheDocument();
    expect(screen.getByLabelText('Page 2')).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('calls onPageChange when next is clicked', async () => {
    const onPageChange = jest.fn();
    const user = userEvent.setup();

    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />,
    );

    await user.click(screen.getByLabelText('Next page'));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
